import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ error: "Código do cupom é obrigatório" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Cupom não encontrado" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Cupom desativado" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json({ valid: false, error: "Cupom ainda não está válido" }, { status: 400 });
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json({ valid: false, error: "Cupom expirado" }, { status: 400 });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "Cupom atingiu o limite de uso" }, { status: 400 });
    }

    const orderSubtotal = subtotal ? parseFloat(subtotal) : 0;
    if (coupon.minOrderValue > 0 && orderSubtotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        error: `Valor mínimo do pedido: R$ ${coupon.minOrderValue.toFixed(2).replace(".", ",")}`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, orderSubtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error: any) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ error: "Erro ao validar cupom" }, { status: 500 });
  }
}
