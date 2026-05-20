import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiGeneralRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    const rl = apiGeneralRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);

    const customers = await prisma.loyaltyPoints.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { points: "desc" },
    });

    return NextResponse.json({
      customers: customers.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.user.fullName,
        userEmail: c.user.email,
        points: c.points,
        totalEarned: c.totalEarned,
        totalSpent: c.totalSpent,
        tier: c.tier,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Admin loyalty GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar fidelidade" }, { status: 500 });
  }
}
