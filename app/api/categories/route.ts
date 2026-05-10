import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { cacheHeaders } from "@/lib/cache";

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(
      { categories },
      { headers: cacheHeaders(300) }
    );
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
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
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const category = await prisma.productCategory.create({
      data: parsed.data,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
