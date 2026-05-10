import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { calculateAge } from "@/lib/utils";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const age = calculateAge(user.dateOfBirth);
    if (age < 18) {
      return NextResponse.json(
        { error: "Produto restrito para maiores de 18 anos" },
        { status: 403 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "Produto indisponível no momento" },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${product.stock} unidades` },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: `Estoque insuficiente. Disponível: ${product.stock} unidades` },
          { status: 400 }
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, unitPrice: product.price },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price,
        },
      });
    }

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
    console.error("Cart add error:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar item ao carrinho" },
      { status: 500 }
    );
  }
}
