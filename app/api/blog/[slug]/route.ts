import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        id: { not: post.id },
        OR: post.category ? [{ category: post.category }] : undefined,
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ post, relatedPosts });
  } catch (error: any) {
    console.error("Blog slug GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
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

    const existing = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
    if (!existing) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, author, category, tags, isPublished } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined && slug !== params.slug) {
      const dup = await prisma.blogPost.findUnique({ where: { slug } });
      if (dup) return NextResponse.json({ error: "Slug já existe" }, { status: 400 });
      updateData.slug = slug;
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt || null;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage || null;
    if (author !== undefined) updateData.author = author;
    if (category !== undefined) updateData.category = category || null;
    if (tags !== undefined) updateData.tags = tags || null;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !existing.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("Blog slug PUT error:", error);
    return NextResponse.json({ error: "Erro ao atualizar post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
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

    const existing = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
    if (!existing) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { slug: params.slug } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Blog slug DELETE error:", error);
    return NextResponse.json({ error: "Erro ao remover post" }, { status: 500 });
  }
}
