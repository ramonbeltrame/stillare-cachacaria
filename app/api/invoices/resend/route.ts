import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendInvoiceEmail } from "@/lib/email-service";
import { z } from "zod";

const resendInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
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
    const parsed = resendInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { invoiceId } = parsed.data;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Nota fiscal não encontrada" },
        { status: 404 }
      );
    }

    await sendInvoiceEmail(invoice.orderId, {
      numero: invoice.nfeNumber,
      chave_acesso: invoice.nfeKey,
      link_download_pdf: invoice.pdfUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Invoice resend error:", error);
    return NextResponse.json(
      { error: "Erro ao reenviar nota fiscal" },
      { status: 500 }
    );
  }
}
