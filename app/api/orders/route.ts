import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email-service";
import { sanitizeInput, apiGeneralRateLimit, getClientIp, rateLimitResponse, isValidAmount, generateTransactionReference } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    const rl = apiGeneralRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    const rl = apiGeneralRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);

    const userId = (session.user as any).id;

    const body = await request.json();
    const shippingAddressId = sanitizeInput(body.shippingAddressId || "");
    const shippingMethod = sanitizeInput(body.shippingMethod || "");
    const customerNotes = sanitizeInput(body.customerNotes || "");
    const couponId = sanitizeInput(body.couponId || "");

    if (!shippingAddressId || !shippingMethod) {
      return NextResponse.json({ error: "Endereço e método de envio são obrigatórios" }, { status: 400 });
    }

    if (!body.ageConfirmed) {
      return NextResponse.json({ error: "Confirmação de maioridade obrigatória" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cart: { include: { items: { include: { product: true } } } },
        addresses: { where: { id: shippingAddressId } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const cart = user.cart;
    // Use cart items from request body if database cart is empty (carrinho via localStorage/Zustand)
    const requestItems: Array<{ productId: string; quantity: number }> = body.items || [];

    if ((!cart || cart.items.length === 0) && requestItems.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const address = user.addresses[0];
    if (!address) {
      return NextResponse.json({ error: "Endereço de entrega não encontrado" }, { status: 404 });
    }

    // Sync request items to database cart if needed
    if (requestItems.length > 0) {
      for (const reqItem of requestItems) {
        const product = await prisma.product.findUnique({
          where: { id: reqItem.productId },
          select: { price: true, stock: true, isActive: true, name: true },
        });
        if (!product?.isActive) {
          return NextResponse.json({ error: `"${product?.name || "Produto"}" não está disponível` }, { status: 400 });
        }
        if (product.stock < reqItem.quantity) {
          return NextResponse.json({ error: `Estoque insuficiente para "${product.name}"` }, { status: 400 });
        }
      }
    }

    // Build order items from database cart OR request body
    const orderItems = cart && cart.items.length > 0
      ? cart.items
      : await Promise.all(requestItems.map(async (reqItem) => {
          const product = await prisma.product.findUnique({
            where: { id: reqItem.productId },
            select: { id: true, name: true, price: true, stock: true, isActive: true },
          });
          return {
            productId: reqItem.productId,
            product: { id: reqItem.productId, name: product?.name || "", price: product?.price || 0, isActive: true },
            unitPrice: product?.price || 0,
            quantity: reqItem.quantity,
          };
        }));

    // Verify prices
    for (const item of orderItems) {
      if (!item.product.isActive) {
        return NextResponse.json({ error: `"${item.product.name}" não está mais disponível` }, { status: 400 });
      }
      const currentProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true, stock: true, isActive: true },
      });
      if (!currentProduct?.isActive) {
        return NextResponse.json({ error: `"${item.product.name}" foi desativado` }, { status: 400 });
      }
      if (currentProduct.stock < item.quantity) {
        return NextResponse.json({ error: `Estoque insuficiente para "${item.product.name}"` }, { status: 400 });
      }
      item.unitPrice = currentProduct.price;
    }

    const subtotal = orderItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

    if (!isValidAmount(subtotal)) {
      return NextResponse.json({ error: "Valor do pedido inválido" }, { status: 400 });
    }

    const shippingCost = 0;
    let discountAmount = 0;
    let validCouponId: string | null = null;

    if (couponId) {
      const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValidFrom = !coupon.validFrom || new Date(coupon.validFrom) <= now;
        const isValidUntil = !coupon.validUntil || new Date(coupon.validUntil) >= now;
        const hasUsesLeft = coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses;
        const meetsMinOrder = subtotal >= coupon.minOrderValue;

        if (isValidFrom && isValidUntil && hasUsesLeft && meetsMinOrder) {
          validCouponId = coupon.id;
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = Math.round((subtotal * coupon.discountValue / 100) * 100) / 100;
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + shippingCost - discountAmount);

    if (!isValidAmount(totalAmount)) {
      return NextResponse.json({ error: "Valor total inválido" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddressId,
          couponId: validCouponId,
          orderNumber,
          billingName: user.fullName,
          billingCpf: user.cpf,
          billingEmail: user.email,
          billingPhone: user.phone,
          subtotal,
          shippingCost,
          discountAmount,
          totalAmount,
          shippingMethod,
          ageConfirmed: true,
          ageConfirmedAt: new Date(),
          customerNotes: customerNotes || null,
          status: "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true, shippingAddress: true },
      });

      if (validCouponId) {
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.transaction.create({
        data: {
          orderId: newOrder.id,
          amount: newOrder.totalAmount,
          paymentMethod: "PIX",
          status: "PENDING",
        },
      });

      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return newOrder;
    });

    sendOrderConfirmationEmail(order.id).catch((err) =>
      console.error("Failed to send order confirmation email:", err)
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
