import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ wishlist });
  } catch (error: any) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar favoritos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Faça login para favoritar" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { userId_productId: { userId, productId } },
      });
      return NextResponse.json({ inWishlist: false, message: "Removido dos favoritos" });
    }

    await prisma.wishlistItem.create({
      data: { userId, productId },
    });

    return NextResponse.json({ inWishlist: true, message: "Adicionado aos favoritos" }, { status: 201 });
  } catch (error: any) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Erro ao atualizar favoritos" }, { status: 500 });
  }
}
