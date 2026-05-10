import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { cacheHeaders } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const featured = searchParams.get("featured");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

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

    const orderBy: any = {};
    switch (sort) {
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      case "name_asc":
        orderBy.name = "asc";
        break;
      case "name_desc":
        orderBy.name = "desc";
        break;
      case "newest":
        orderBy.createdAt = "desc";
        break;
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
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
