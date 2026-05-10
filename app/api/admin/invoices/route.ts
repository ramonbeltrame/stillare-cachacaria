import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;

  const admin = await prisma.admin.findUnique({
    where: { email: (session.user as any).email || "" },
  });
  if (!admin || !admin.isActive) return null;

  return admin;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              billingName: true,
              billingEmail: true,
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Admin invoices error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notas fiscais" },
      { status: 500 }
    );
  }
}
