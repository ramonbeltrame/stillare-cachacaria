import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;

  const admin = await prisma.admin.findUnique({
    where: { email: (session.user as any).email || "" },
  });
  if (!admin || !admin.isActive) return null;

  return admin;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            cpf: true,
            dateOfBirth: true,
            status: true,
            createdAt: true,
          },
        },
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

    const auditLogs = await prisma.auditLog.findMany({
      where: { resourceId: params.id, resourceType: "Order" },
      include: { admin: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ order, auditLogs });
  } catch (error: any) {
    console.error("Admin order detail error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}
