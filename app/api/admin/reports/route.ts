import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "sales";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? startOfDay(new Date(startDate)) : startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(new Date());

    switch (type) {
      case "sales": {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            paymentStatus: "APPROVED",
          },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            user: { select: { fullName: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        const totalRevenue = orders.reduce(
          (sum: number, o: { totalAmount: any }) => sum + Number(o.totalAmount),
          0
        );

        const ordersByDay = orders.reduce((acc: Record<string, { count: number; revenue: number }>, o: { createdAt: Date; totalAmount: any }) => {
          const day = o.createdAt.toISOString().slice(0, 10);
          if (!acc[day]) acc[day] = { count: 0, revenue: 0 };
          acc[day].count++;
          acc[day].revenue += Number(o.totalAmount);
          return acc;
        }, {});

        return NextResponse.json({
          type: "sales",
          period: { start, end },
          totalRevenue,
          totalOrders: orders.length,
          averageTicket: orders.length > 0 ? totalRevenue / orders.length : 0,
          ordersByDay,
          orders,
        });
      }

      case "products": {
        const orderItems = await prisma.orderItem.findMany({
          where: {
            order: {
              createdAt: { gte: start, lte: end },
              paymentStatus: "APPROVED",
            },
          },
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, sku: true },
            },
          },
        });

        const productSales = orderItems.reduce(
          (acc: Record<string, any>, item: { productId: string; quantity: number; unitPrice: any; product: any }) => {
            const key = item.productId;
            if (!acc[key]) {
              acc[key] = {
                product: item.product,
                totalQuantity: 0,
                totalRevenue: 0,
              };
            }
            acc[key].totalQuantity += item.quantity;
            acc[key].totalRevenue += Number(item.unitPrice) * item.quantity;
            return acc;
          },
          {}
        );

        const sortedProducts = Object.values(productSales).sort(
          (a: any, b: any) => b.totalRevenue - a.totalRevenue
        );

        return NextResponse.json({
          type: "products",
          period: { start, end },
          products: sortedProducts,
        });
      }

      case "customers": {
        const usersWithOrders = await prisma.user.findMany({
          where: {
            orders: {
              some: {
                createdAt: { gte: start, lte: end },
              },
            },
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
            orders: {
              where: {
                createdAt: { gte: start, lte: end },
              },
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                createdAt: true,
              },
            },
          },
        });

        const customerData = usersWithOrders
          .map((user: { id: string; fullName: string; email: string; createdAt: Date; orders: any[] }) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            registeredAt: user.createdAt,
            orderCount: user.orders.length,
            totalSpent: user.orders.reduce(
              (sum: number, o: { totalAmount: any }) => sum + Number(o.totalAmount),
              0
            ),
            orders: user.orders,
          }))
          .sort((a: { totalSpent: number }, b: { totalSpent: number }) => b.totalSpent - a.totalSpent);

        return NextResponse.json({
          type: "customers",
          period: { start, end },
          customers: customerData,
        });
      }

      case "financial": {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
          },
          select: {
            id: true,
            orderNumber: true,
            subtotal: true,
            shippingCost: true,
            discountAmount: true,
            totalAmount: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        });

        const approvedOrders = orders.filter(
          (o: { paymentStatus: string }) => o.paymentStatus === "APPROVED"
        );
        const pendingOrders = orders.filter(
          (o: { paymentStatus: string }) => o.paymentStatus === "PENDING"
        );
        const failedOrders = orders.filter(
          (o: { paymentStatus: string }) => o.paymentStatus === "FAILED"
        );

        const totalApproved = approvedOrders.reduce(
          (sum: number, o: { totalAmount: any }) => sum + Number(o.totalAmount),
          0
        );
        const totalPending = pendingOrders.reduce(
          (sum: number, o: { totalAmount: any }) => sum + Number(o.totalAmount),
          0
        );
        const totalFailed = failedOrders.reduce(
          (sum: number, o: { totalAmount: any }) => sum + Number(o.totalAmount),
          0
        );

        return NextResponse.json({
          type: "financial",
          period: { start, end },
          summary: {
            totalApproved,
            totalPending,
            totalFailed,
            approvedCount: approvedOrders.length,
            pendingCount: pendingOrders.length,
            failedCount: failedOrders.length,
          },
          orders,
        });
      }

      default:
        return NextResponse.json(
          { error: "Tipo de relatório inválido. Use: sales, products, customers, financial" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Admin reports error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
