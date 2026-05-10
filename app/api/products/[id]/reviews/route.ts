import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId: params.id, isVisible: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { productId: params.id, isVisible: true } }),
      prisma.review.aggregate({
        where: { productId: params.id, isVisible: true },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    const ratingCounts = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId: params.id, isVisible: true },
      _count: { rating: true },
    });

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingCounts.forEach((r) => {
      distribution[r.rating] = r._count.rating;
    });

    return NextResponse.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
      totalRatings: stats._count.rating,
      distribution,
    });
  } catch (error: any) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar avaliações" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Faça login para avaliar" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userName = (session.user as any).fullName || (session.user as any).name || "Cliente";

    const body = await request.json();
    const { rating, title, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliação de 1 a 5 é obrigatória" }, { status: 400 });
    }

    if (!comment || comment.trim().length < 3) {
      return NextResponse.json({ error: "Comentário deve ter pelo menos 3 caracteres" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const existingReview = await prisma.review.findFirst({
      where: { productId: params.id, userId },
    });

    if (existingReview) {
      const review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          title: title || null,
          comment: comment.trim(),
        },
      });

      return NextResponse.json({ review });
    }

    const review = await prisma.review.create({
      data: {
        productId: params.id,
        userId,
        userName,
        rating,
        title: title || null,
        comment: comment.trim(),
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Erro ao salvar avaliação" }, { status: 500 });
  }
}
