import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const admin = await prisma.admin.findUnique({
    where: { email: (session.user as any).email || "" },
  });
  if (!admin || !admin.isActive) return null;
  return admin;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { orders: { select: { id: true, orderNumber: true, totalAmount: true, createdAt: true } } },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Admin coupons GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar cupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const body = await request.json();
    const { code, description, discountType, discountValue, minOrderValue, maxUses, isActive, validFrom, validUntil } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Código e valor de desconto são obrigatórios" }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "Código de cupom já existe" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxUses: maxUses ? parseInt(maxUses) : 0,
        isActive: isActive !== undefined ? isActive : true,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    console.error("Admin coupons POST error:", error);
    return NextResponse.json({ error: "Erro ao criar cupom" }, { status: 500 });
  }
}
