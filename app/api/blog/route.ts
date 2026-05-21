import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "9")));
    const category = searchParams.get("category");
    const admin = searchParams.get("admin");

    const where: any = {};

    if (admin === "true") {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      const adminUser = await prisma.admin.findUnique({
        where: { email: (session.user as any).email || "" },
      });
      if (!adminUser?.isActive) {
        return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
      }
    } else {
      where.isPublished = true;
    }

    if (category) {
      where.category = category;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("Blog GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar posts" }, { status: 500 });
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
    if (!admin?.isActive) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, author, category, tags, isPublished } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Título, slug e conteúdo são obrigatórios" }, { status: 400 });
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        author: author || "Stillare",
        category: category || null,
        tags: tags || null,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Blog POST error:", error);
    return NextResponse.json({ error: "Erro ao criar post" }, { status: 500 });
  }
}
