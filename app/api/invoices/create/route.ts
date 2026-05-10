import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitirNFe } from "@/lib/nuvemfiscal";
import { z } from "zod";

const createInvoiceSchema = z.object({
  orderId: z.string().min(1),
});

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
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const nfeData = await emitirNFe(orderId);

    const invoice = await prisma.invoice.findUnique({ where: { orderId } });

    return NextResponse.json({ invoice: invoice || nfeData }, { status: 201 });
  } catch (error: any) {
    console.error("Invoice create error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao emitir nota fiscal" },
      { status: 500 }
    );
  }
}
