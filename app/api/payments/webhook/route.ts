import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email-service";
import { emitirNFe } from "@/lib/nuvemfiscal";
import { webhookRateLimit, getClientIp, sanitizeInput, rateLimitResponse } from "@/lib/security";
import crypto from "crypto";
export const dynamic = "force-dynamic";

function getTierFromPoints(points: number): string {
  if (points >= 1000) return "DIAMANTE";
  if (points >= 500) return "OURO";
  if (points >= 100) return "PRATA";
  return "BRONZE";
}

function validateMPSignature(request: Request, body: any): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  const dataId = body?.data?.id;
  if (!signature || !dataId || !requestId) return false;

  const parts: Record<string, string> = {};
  signature.split(",").forEach((part) => {
    const [k, v] = part.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  });

  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === parts.v1;
}

let processedPaymentIds = new Set<string>();
setInterval(() => { processedPaymentIds = new Set(); }, 60 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = webhookRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);

    const body = await request.json();

    if (!validateMPSignature(request, body)) {
      console.warn("[SECURITY] Webhook signature validation failed from IP:", ip);
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 403 });
    }

    const { type, data } = body;
    if (type !== "payment" || !data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(data.id);
    if (processedPaymentIds.has(paymentId)) {
      console.log("[WEBHOOK] Duplicate payment ignored:", paymentId);
      return NextResponse.json({ received: true });
    }
    processedPaymentIds.add(paymentId);

    let paymentData: any = { id: data.id, status: "pending" };

    if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${data.id}`,
          {
            headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (mpResponse.ok) {
          paymentData = await mpResponse.json();
        }
      } catch (err) {
        console.error("[WEBHOOK] Failed to fetch payment details:", err);
        return NextResponse.json({ received: true });
      }
    }

    await processPayment(paymentData);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[WEBHOOK] Error:", error.message);
    return NextResponse.json({ received: true });
  }
}

async function processPayment(paymentData: any) {
  const externalRef = paymentData.external_reference;
  if (!externalRef) {
    console.warn("[WEBHOOK] No external_reference in payment");
    return;
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber: externalRef },
    include: { items: { include: { product: true } }, transactions: true },
  });

  if (!order) {
    console.warn("[WEBHOOK] Order not found:", externalRef);
    return;
  }

  if (order.paymentStatus === "APPROVED") {
    console.log("[WEBHOOK] Order already processed:", order.orderNumber);
    return;
  }

  const mpStatus = (paymentData.status || "").toUpperCase();
  const mpId = String(paymentData.id || "");

  if (mpStatus === "APPROVED" || mpStatus === "AUTHORIZED") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "APPROVED",
          paidAt: new Date(),
        },
      });

      await tx.transaction.upsert({
        where: { id: order.transactions[0]?.id || "none" },
        update: {
          status: "AUTHORIZED",
          mercadoPagoId: mpId,
          mercadoPagoPaymentId: mpId,
          responseCode: paymentData.status_detail || null,
          responseMessage: paymentData.status || null,
          rawResponse: JSON.stringify(paymentData).slice(0, 10000),
        },
        create: {
          orderId: order.id,
          amount: order.totalAmount,
          paymentMethod: mapPaymentMethod(paymentData.payment_type_id),
          status: "AUTHORIZED",
          mercadoPagoId: mpId,
          mercadoPagoPaymentId: mpId,
          rawResponse: JSON.stringify(paymentData).slice(0, 10000),
        },
      });

      for (const item of order.items) {
        const currentProduct = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        if (!currentProduct) continue;

        const newStock = Math.max(0, currentProduct.stock - item.quantity);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });
      }

      const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    });

    await awardLoyaltyPoints(order).catch((err) => console.error("[WEBHOOK] Loyalty error:", err));

    emitirNFe(order.id).catch((err) => console.error("[WEBHOOK] NFe error:", err));
    sendOrderConfirmationEmail(order.id).catch((err) => console.error("[WEBHOOK] Email error:", err));
  } else if (mpStatus === "REJECTED" || mpStatus === "CANCELLED" || mpStatus === "REFUNDED") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });

    await prisma.transaction.updateMany({
      where: { orderId: order.id },
      data: { status: "DECLINED", responseCode: paymentData.status_detail || null },
    });
  }
}

function mapPaymentMethod(type: string): string {
  const map: Record<string, string> = {
    credit_card: "CREDIT_CARD",
    debit_card: "DEBIT_CARD",
    pix: "PIX",
    ticket: "BOLETO",
    account_money: "PIX",
  };
  return map[type] || "PIX";
}

async function awardLoyaltyPoints(order: { id: string; userId: string; totalAmount: number }) {
  const pointsEarned = Math.floor(order.totalAmount / 10);
  if (pointsEarned <= 0) return;

  let loyalty = await prisma.loyaltyPoints.findUnique({ where: { userId: order.userId } });

  if (!loyalty) {
    loyalty = await prisma.loyaltyPoints.create({
      data: { userId: order.userId, points: 0, totalEarned: 0, totalSpent: 0, tier: "BRONZE" },
    });
  }

  const newPoints = loyalty.points + pointsEarned;

  await prisma.$transaction([
    prisma.loyaltyPoints.update({
      where: { id: loyalty.id },
      data: {
        points: newPoints,
        totalEarned: { increment: pointsEarned },
        tier: getTierFromPoints(newPoints),
      },
    }),
    prisma.loyaltyHistory.create({
      data: {
        loyaltyId: loyalty.id,
        points: pointsEarned,
        type: "EARNED",
        description: `${pointsEarned} pontos ganhos no pedido #${order.id.slice(-8)}`,
        orderId: order.id,
      },
    }),
  ]);
}
