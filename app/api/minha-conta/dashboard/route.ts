import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const [lastOrder, totalOrders, totalSpentResult, recentOrders] = await Promise.all([
      prisma.order.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { id: true, productName: true, quantity: true, unitPrice: true } },
        },
      }),
      prisma.order.count({ where: { userId } }),
      prisma.order.aggregate({
        where: { userId, paymentStatus: { notIn: ["FAILED", "REFUNDED"] } },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: { select: { id: true, productName: true, quantity: true, unitPrice: true } },
        },
      }),
    ]);

    const totalSpent = totalSpentResult._sum.totalAmount || 0;

    return NextResponse.json({
      lastOrder,
      totalOrders,
      totalSpent,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
