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

    const customer = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        cpf: true,
        dateOfBirth: true,
        status: true,
        verifiedEmail: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: params.id },
      include: {
        items: { include: { product: { select: { name: true, sku: true } } } },
        invoice: { select: { id: true, nfeNumber: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalSpent = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0
    );

    return NextResponse.json({
      customer: {
        ...customer,
        totalSpent,
        totalOrders: orders.length,
      },
      orders,
    });
  } catch (error: any) {
    console.error("Admin customer detail error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}
