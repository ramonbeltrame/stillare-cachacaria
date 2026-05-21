import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizeInput, apiGeneralRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";
export const dynamic = "force-dynamic";

const TIER_THRESHOLDS: Record<string, { min: number; label: string; discount: number }> = {
  BRONZE: { min: 0, label: "Bronze", discount: 0 },
  PRATA: { min: 100, label: "Prata", discount: 5 },
  OURO: { min: 500, label: "Ouro", discount: 10 },
  DIAMANTE: { min: 1000, label: "Diamante", discount: 15 },
};

function getTierFromPoints(points: number): string {
  if (points >= 1000) return "DIAMANTE";
  if (points >= 500) return "OURO";
  if (points >= 100) return "PRATA";
  return "BRONZE";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    const rl = apiGeneralRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);

    const userId = (session.user as any).id;

    let loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!loyalty) {
      loyalty = await prisma.loyaltyPoints.create({
        data: {
          userId,
          points: 0,
          totalEarned: 0,
          totalSpent: 0,
          tier: "BRONZE",
        },
        include: {
          history: true,
        },
      });
    }

    const currentTier = TIER_THRESHOLDS[loyalty.tier] || TIER_THRESHOLDS.BRONZE;
    const nextTierKey = loyalty.tier === "BRONZE" ? "PRATA" : loyalty.tier === "PRATA" ? "OURO" : loyalty.tier === "OURO" ? "DIAMANTE" : null;
    const nextTier = nextTierKey ? TIER_THRESHOLDS[nextTierKey] : null;

    const nextPurchasePoints = Math.floor(Math.max(10, loyalty.points * 0.05) / 10);

    return NextResponse.json({
      id: loyalty.id,
      points: loyalty.points,
      totalEarned: loyalty.totalEarned,
      totalSpent: loyalty.totalSpent,
      tier: loyalty.tier,
      tierLabel: currentTier.label,
      tierDiscount: currentTier.discount,
      nextTier: nextTier ? { key: nextTierKey, label: nextTier.label, min: nextTier.min, discount: nextTier.discount } : null,
      pointsToNextTier: nextTier ? Math.max(0, nextTier.min - loyalty.points) : 0,
      nextPurchasePoints,
      history: loyalty.history,
    });
  } catch (error: any) {
    console.error("Loyalty GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar fidelidade" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    const rl = apiGeneralRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);

    const userId = (session.user as any).id;
    const body = await request.json();
    const pointsToRedeem = Math.floor(Number(body.points) || 0);

    if (pointsToRedeem <= 0) {
      return NextResponse.json({ error: "Quantidade de pontos inválida" }, { status: 400 });
    }

    const loyalty = await prisma.loyaltyPoints.findUnique({ where: { userId } });

    if (!loyalty || loyalty.points < pointsToRedeem) {
      return NextResponse.json({ error: "Pontos insuficientes" }, { status: 400 });
    }

    const discountValue = pointsToRedeem * 0.05;

    const coupon = await prisma.coupon.create({
      data: {
        code: `FIDELIDADE-${userId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        description: `Cupom de fidelidade - ${pointsToRedeem} pontos trocados`,
        discountType: "FIXED",
        discountValue,
        minOrderValue: Math.max(0, discountValue),
        maxUses: 1,
        isActive: true,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    const newPoints = loyalty.points - pointsToRedeem;

    await prisma.$transaction([
      prisma.loyaltyPoints.update({
        where: { userId },
        data: {
          points: newPoints,
          totalSpent: { increment: pointsToRedeem },
          tier: getTierFromPoints(newPoints),
        },
      }),
      prisma.loyaltyHistory.create({
        data: {
          loyaltyId: loyalty.id,
          points: -pointsToRedeem,
          type: "REDEEMED",
          description: `${pointsToRedeem} pontos trocados por cupom de R$ ${discountValue.toFixed(2).replace(".", ",")}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountValue,
        discountLabel: `R$ ${discountValue.toFixed(2).replace(".", ",")}`,
        validUntil: coupon.validUntil,
      },
      remainingPoints: newPoints,
    });
  } catch (error: any) {
    console.error("Loyalty POST error:", error);
    return NextResponse.json({ error: "Erro ao resgatar pontos" }, { status: 500 });
  }
}
