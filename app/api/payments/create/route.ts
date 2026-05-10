import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const paymentCreateSchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const body = await request.json();
    const parsed = paymentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    if (order.paymentStatus === "APPROVED") {
      return NextResponse.json(
        { error: "Pagamento já aprovado para este pedido" },
        { status: 400 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Pedido cancelado" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const isDev = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

    // Modo desenvolvimento: sempre usa mock (MP bloqueia localhost)
    if (isDev || !process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN.startsWith("TEST-")) {
      const mockInitPoint = `${appUrl}/pedido/${order.id}/pagamento-mock`;
      return NextResponse.json({ init_point: mockInitPoint });
    }

    try {
      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: order.items.map((item: { productId: string; productName: string; quantity: number; unitPrice: any }) => ({
            id: item.productId,
            title: item.productName,
            quantity: item.quantity,
            currency_id: "BRL",
            unit_price: Number(item.unitPrice),
          })),
          payer: {
            email: order.billingEmail,
            name: order.billingName,
          },
          back_urls: {
            success: `${appUrl}/pedido/${order.id}/pagamento-mock`,
            failure: `${appUrl}/pedido/${order.id}/pagamento-mock`,
            pending: `${appUrl}/pedido/${order.id}/pagamento-mock`,
          },
          external_reference: order.orderNumber,
          notification_url: `${appUrl}/api/payments/webhook`,
        }),
      });

      const preference = await mpResponse.json();

      if (!mpResponse.ok) {
        console.error("Mercado Pago error:", preference);
        throw new Error(preference.message || "Erro ao criar preferência");
      }

      return NextResponse.json({ init_point: preference.init_point });
    } catch (mpError: any) {
      console.error("Mercado Pago API error:", mpError);
      const mockInitPoint = `${appUrl}/pedido/${order.id}/pagamento-mock`;
      return NextResponse.json({ init_point: mockInitPoint });
    }
  } catch (error: any) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}
