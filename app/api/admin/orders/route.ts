import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendOrderShippedEmail } from "@/lib/email-service";
import { sendEmail, getEmailTemplate } from "@/lib/sendgrid";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;

  const admin = await prisma.admin.findUnique({
    where: { email: (session.user as any).email || "" },
  });
  if (!admin || !admin.isActive) return null;

  return { session, admin };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { billingName: { contains: search, mode: "insensitive" } },
        { billingEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          items: { include: { product: { select: { name: true, sku: true } } } },
          shippingAddress: true,
          invoice: { select: { nfeNumber: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const { admin } = authResult;

    const body = await request.json();
    const { orderId, status, trackingCode, adminNotes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID do pedido obrigatório" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingCode !== undefined) updateData.trackingCode = trackingCode;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    if (status === "SHIPPED" && existingOrder.status !== "SHIPPED") {
      updateData.shippedAt = new Date();
    }
    if (status === "DELIVERED" && existingOrder.status !== "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        items: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_ORDER",
        resourceType: "Order",
        resourceId: orderId,
        oldValues: JSON.stringify({
          status: existingOrder.status,
          trackingCode: existingOrder.trackingCode,
          adminNotes: existingOrder.adminNotes,
        }),
        newValues: JSON.stringify({
          status: updatedOrder.status,
          trackingCode: updatedOrder.trackingCode,
          adminNotes: updatedOrder.adminNotes,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || null,
      },
    });

    if (status === "SHIPPED" && existingOrder.status !== "SHIPPED") {
      sendOrderShippedEmail(orderId).catch((err) =>
        console.error("Failed to send shipped email:", err)
      );
    }

    if (status === "DELIVERED" && existingOrder.status !== "DELIVERED") {
      const deliveredHtml = getEmailTemplate("order-delivered", {
        fullName: updatedOrder.billingName,
        orderNumber: updatedOrder.orderNumber,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      });

      sendEmail({
        to: updatedOrder.billingEmail,
        subject: `Pedido ${updatedOrder.orderNumber} entregue! 🥃`,
        html: deliveredHtml,
      }).then(async () => {
        await prisma.emailLog.create({
          data: {
            userId: updatedOrder.userId,
            recipientEmail: updatedOrder.billingEmail,
            subject: `Pedido ${updatedOrder.orderNumber} entregue`,
            emailType: "ORDER_DELIVERED",
            status: "SENT",
          },
        });
      }).catch((err) => console.error("Failed to send delivered email:", err));
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Admin orders PUT error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}
