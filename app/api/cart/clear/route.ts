import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cart clear error:", error);
    return NextResponse.json(
      { error: "Erro ao limpar carrinho" },
      { status: 500 }
    );
  }
}
