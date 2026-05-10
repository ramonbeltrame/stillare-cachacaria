import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;

  const admin = await prisma.admin.findUnique({
    where: { email: (session.user as any).email || "" },
  });
  if (!admin || !admin.isActive) return null;

  return admin;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { displayOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Admin products GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
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
    console.error("Admin products POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do produto obrigatório" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const parsed = productSchema.partial().safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true, images: true },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Admin products PUT error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}
