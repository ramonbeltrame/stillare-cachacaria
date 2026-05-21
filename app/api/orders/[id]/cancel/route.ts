import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    if (order.status !== "PENDING" && order.status !== "PAID") {
      return NextResponse.json(
        { error: `Pedido não pode ser cancelado. Status atual: ${order.status}` },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      include: {
        items: true,
        transactions: true,
      },
    });

    await prisma.transaction.updateMany({
      where: { orderId: order.id },
      data: { status: "REFUNDED" },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Order cancel error:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar pedido" },
      { status: 500 }
    );
  }
}
