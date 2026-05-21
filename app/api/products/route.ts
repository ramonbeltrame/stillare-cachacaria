import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { cacheHeaders } from "@/lib/cache";
export const dynamic = "force-dynamic";

// Map alcohol range to filter
function getAlcoholRange(range: string): { gte?: number; lte?: number } | null {
  switch (range) {
    case "38-40":
      return { gte: 38, lte: 40 };
    case "40-42":
      return { gte: 40, lte: 42 };
    case "42+":
      return { gte: 42 };
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Accept both frontend param names (pt-BR) and API param names (en)
    const page = Math.max(1, parseInt(searchParams.get("pagina") || searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limite") || searchParams.get("limit") || "12")));
    const category = searchParams.get("categoria") || searchParams.get("category");
    const search = searchParams.get("busca") || searchParams.get("search");
    const sort = searchParams.get("ordenar") || searchParams.get("sort") || "relevance";
    const featured = searchParams.get("destaque") || searchParams.get("featured");
    const minPrice = searchParams.get("precoMin") || searchParams.get("minPrice");
    const maxPrice = searchParams.get("precoMax") || searchParams.get("maxPrice");

    // New filters
    const volumeRaw = searchParams.getAll("volume");
    const alcoholRaw = searchParams.getAll("alcohol");
    const madeiraRaw = searchParams.getAll("madeira");

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Volume filter (multiple values = OR)
    if (volumeRaw.length > 0) {
      const volumes = volumeRaw.map(Number).filter((n) => !isNaN(n));
      if (volumes.length > 0) {
        where.volumeMl = { in: volumes };
      }
    }

    // Alcohol percentage filter (multiple ranges = OR)
    if (alcoholRaw.length > 0) {
      const alcoholConditions: any[] = [];
      for (const range of alcoholRaw) {
        const filter = getAlcoholRange(range);
        if (filter) alcoholConditions.push({ alcoholPercentage: filter });
      }
      if (alcoholConditions.length > 0) {
        where.AND = [...(where.AND || []), { OR: alcoholConditions }];
      }
    }

    // Madeira filter (search in name + description + madeira field)
    if (madeiraRaw.length > 0) {
      const madeiraConditions: any[] = [];
      for (const m of madeiraRaw) {
        madeiraConditions.push({ madeira: { contains: m, mode: "insensitive" } });
        madeiraConditions.push({ name: { contains: m, mode: "insensitive" } });
        madeiraConditions.push({ description: { contains: m, mode: "insensitive" } });
      }
      where.AND = [...(where.AND || []), { OR: madeiraConditions }];
    }

    // Sort / Order by
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
      case "menor_preco":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
      case "maior_preco":
        orderBy = { price: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "relevance":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Bestsellers sort requires post-fetch ordering by order count
    const isBestseller = sort === "bestsellers" || sort === "mais_vendidos";

    let products: any[] = [];
    let total = 0;

    if (isBestseller) {
      // For bestsellers, fetch all matching products first, then sort by order frequency
      const allProducts = await prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { displayOrder: "asc" } },
        },
      });

      // Count how many orders contain each product
      const productIds = allProducts.map((p) => p.id);
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true },
      });

      const orderCountMap: Record<string, number> = {};
      for (const item of orderItems) {
        orderCountMap[item.productId] = (orderCountMap[item.productId] || 0) + 1;
      }

      // Sort by order count descending, then by createdAt for products with no orders
      allProducts.sort((a, b) => {
        const countA = orderCountMap[a.id] || 0;
        const countB = orderCountMap[b.id] || 0;
        if (countB !== countA) return countB - countA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      total = allProducts.length;
      products = allProducts.slice((page - 1) * limit, page * limit);
    } else {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true,
            images: { orderBy: { displayOrder: "asc" } },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
    }

    return NextResponse.json(
      {
        products,
        total,
        pages: Math.ceil(total / limit),
      },
      { headers: cacheHeaders(120) }
    );
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: parsed.data,
      include: { category: true, images: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
