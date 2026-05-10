import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
      include: { category: true, images: true },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { error: "Erro ao remover produto" },
      { status: 500 }
    );
  }
}
