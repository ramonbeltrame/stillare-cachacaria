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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { code, description, discountType, discountValue, minOrderValue, maxUses, isActive, validFrom, validUntil } = body;

    const updateData: any = {};
    if (code !== undefined) {
      const dup = await prisma.coupon.findFirst({ where: { code: code.toUpperCase(), NOT: { id: params.id } } });
      if (dup) {
        return NextResponse.json({ error: "Código de cupom já existe" }, { status: 400 });
      }
      updateData.code = code.toUpperCase();
    }
    if (description !== undefined) updateData.description = description || null;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (minOrderValue !== undefined) updateData.minOrderValue = parseFloat(minOrderValue);
    if (maxUses !== undefined) updateData.maxUses = parseInt(maxUses);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("Admin coupons PUT error:", error);
    return NextResponse.json({ error: "Erro ao atualizar cupom" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin coupons DELETE error:", error);
    return NextResponse.json({ error: "Erro ao remover cupom" }, { status: 500 });
  }
}
