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

  return { session, admin };
}

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdmin();
    if (!adminAuth) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const where: any = {};

    if (type) {
      where.emailType = type;
    }

    if (status) {
      where.status = status;
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error: any) {
    console.error("Admin emails GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar logs de email" },
      { status: 500 }
    );
  }
}
