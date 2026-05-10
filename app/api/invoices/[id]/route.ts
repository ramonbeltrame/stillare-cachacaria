import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const invoiceId = params.id;

    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id: invoiceId }, { orderId: invoiceId }],
      },
      include: { order: { include: { items: true } } },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Nota fiscal não encontrada" },
        { status: 404 }
      );
    }

    if (invoice.userId !== userId) {
      const admin = await prisma.admin.findUnique({
        where: { email: (session.user as any).email || "" },
      });
      if (!admin || !admin.isActive) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error("Invoice GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar nota fiscal" },
      { status: 500 }
    );
  }
}
