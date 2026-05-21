import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheHeaders } from "@/lib/cache";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    // Find orders containing this product
    const relatedOrderItems = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
    });
    const orderIds = relatedOrderItems
      .map((i) => i.orderId)
      .filter((v, i, a) => a.indexOf(v) === i);

    if (orderIds.length === 0) {
      // Fallback: return products from same category
      const fallback = await prisma.product.findMany({
        where: {
          id: productId,
        },
        select: { categoryId: true },
      });
      const catId = fallback[0]?.categoryId;
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { not: productId },
          isActive: true,
          ...(catId ? { categoryId: catId } : {}),
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { displayOrder: "asc" } },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        { products: fallbackProducts },
        { headers: cacheHeaders(120) }
      );
    }

    // Find other products from those orders, excluding the current product
    const otherItems = await prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
        productId: { not: productId },
      },
      select: { productId: true },
    });

    // Count frequency
    const frequencyMap: Record<string, number> = {};
    for (const item of otherItems) {
      frequencyMap[item.productId] =
        (frequencyMap[item.productId] || 0) + 1;
    }

    // Sort by frequency descending, get top 4
    const sortedIds = Object.entries(frequencyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([id]) => id);

    if (sortedIds.length === 0) {
      return NextResponse.json(
        { products: [] },
        { headers: cacheHeaders(120) }
      );
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { in: sortedIds },
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { displayOrder: "asc" } },
      },
    });

    // Maintain frequency order
    const ordered = sortedIds
      .map((id) => relatedProducts.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json(
      { products: ordered },
      { headers: cacheHeaders(120) }
    );
  } catch (error: any) {
    console.error("Related products GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos relacionados" },
      { status: 500 }
    );
  }
}
