import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const removeFromCartSchema = z.object({
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const body = await request.json();
    const parsed = removeFromCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 404 });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                slug: true,
                stock: true,
                isActive: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ cart: updatedCart });
  } catch (error: any) {
    console.error("Cart remove error:", error);
    return NextResponse.json(
      { error: "Erro ao remover item do carrinho" },
      { status: 500 }
    );
  }
}
