import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        transactions: true,
        invoice: true,
        shippingTracking: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Order GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    if (order.userId !== userId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        paymentStatus: body.paymentStatus || order.paymentStatus,
        status: body.status || order.status,
        paidAt: body.status === "PAID" ? new Date() : order.paidAt,
      },
    });

    if (body.status === "PAID" && order.status !== "PAID") {
      const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return NextResponse.json({ order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
