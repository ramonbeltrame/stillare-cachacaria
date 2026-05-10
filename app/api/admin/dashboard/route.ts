import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function subDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - days);
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: (session.user as any).email || "" },
    });
    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const thirtyDaysAgo = subDays(today, 30);

    const [
      todayOrders,
      todayRevenueResult,
      pendingOrders,
      newCustomers,
      recentOrders,
      revenueByDayRaw,
      topProductsRaw,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          paymentStatus: "APPROVED",
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.user.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          paymentStatus: "APPROVED",
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          stock: { lte: prisma.product.fields.reorderLevel },
        },
        include: {
          category: { select: { name: true } },
        },
        take: 10,
      }),
    ]);

    const revenueByDay = new Map<string, number>();
    for (const order of revenueByDayRaw) {
      const day = order.createdAt.toISOString().slice(0, 10);
      revenueByDay.set(day, (revenueByDay.get(day) || 0) + Number(order.totalAmount));
    }
    const revenueByDayArray = Array.from(revenueByDay.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topProductIds = topProductsRaw.map((p: { productId: string }) => p.productId);
    const topProductsData = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, slug: true, price: true, stock: true },
    });
    const topProducts = topProductsRaw.map((item: { productId: string; _sum: { quantity: number | null } }) => {
      const product = topProductsData.find((p: { id: string }) => p.id === item.productId);
      return {
        ...product,
        totalSold: item._sum.quantity,
      };
    });

    return NextResponse.json({
      todayRevenue: todayRevenueResult._sum.totalAmount
        ? Number(todayRevenueResult._sum.totalAmount)
        : 0,
      todayOrders,
      pendingOrders,
      newCustomers,
      recentOrders,
      revenueByDay: revenueByDayArray,
      topProducts,
      lowStockProducts,
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dashboard" },
      { status: 500 }
    );
  }
}
