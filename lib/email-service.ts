import { prisma } from "./prisma";
import { sendEmail, getEmailTemplate } from "./sendgrid";

export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) return;

    const html = getEmailTemplate("order-confirmation", {
      fullName: order.billingName,
      orderNumber: order.orderNumber,
      orderId: order.id,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    await sendEmail({
      to: order.billingEmail,
      subject: `Pedido ${order.orderNumber} confirmado! 🎉`,
      html,
    });

    await prisma.emailLog.create({
      data: {
        userId: order.userId,
        recipientEmail: order.billingEmail,
        subject: `Pedido ${order.orderNumber} confirmado!`,
        emailType: "ORDER_CONFIRMATION",
        status: "SENT",
      },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation email:", error);
    await prisma.emailLog.create({
      data: {
        recipientEmail: "",
        emailType: "ORDER_CONFIRMATION",
        status: "FAILED",
        errorMessage: error.message,
      },
    });
  }
}

export async function sendOrderShippedEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, shippingTracking: true },
    });

    if (!order) return;

    const html = getEmailTemplate("order-shipped", {
      fullName: order.billingName,
      orderNumber: order.orderNumber,
      trackingCode: order.trackingCode,
      estimatedDelivery: "",
    });

    await sendEmail({
      to: order.billingEmail,
      subject: `Seu pedido ${order.orderNumber} saiu para entrega! 📦`,
      html,
    });

    await prisma.emailLog.create({
      data: {
        userId: order.userId,
        recipientEmail: order.billingEmail,
        subject: `Pedido ${order.orderNumber} enviado`,
        emailType: "ORDER_SHIPPED",
        status: "SENT",
      },
    });
  } catch (error: any) {
    console.error("Error sending shipped email:", error);
  }
}

export async function sendInvoiceEmail(orderId: string, nfeData: any) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) return;

    const html = getEmailTemplate("invoice", {
      fullName: order.billingName,
      orderNumber: order.orderNumber,
      nfeNumber: nfeData.numero,
      nfeKey: nfeData.chave_acesso,
      pdfUrl: nfeData.link_download_pdf,
    });

    await sendEmail({
      to: order.billingEmail,
      subject: `Sua Nota Fiscal está pronta — Pedido ${order.orderNumber}`,
      html,
    });

    await prisma.emailLog.create({
      data: {
        userId: order.userId,
        recipientEmail: order.billingEmail,
        subject: `NFe — Pedido ${order.orderNumber}`,
        emailType: "INVOICE",
        status: "SENT",
      },
    });
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
  }
}

export async function sendWelcomeEmail(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const html = getEmailTemplate("welcome", {
      fullName: user.fullName,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    await sendEmail({
      to: user.email,
      subject: "Bem-vindo(a) à Stillare Cachaçaria! 🥃",
      html,
    });

    await prisma.emailLog.create({
      data: {
        userId: user.id,
        recipientEmail: user.email,
        subject: "Bem-vindo(a) à Stillare",
        emailType: "WELCOME",
        status: "SENT",
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
  }
}

export async function sendPasswordResetEmail(userId: string, token: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const html = getEmailTemplate("password-reset", {
      fullName: user.fullName,
      resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`,
    });

    await sendEmail({
      to: user.email,
      subject: "Redefinição de Senha — Stillare",
      html,
    });

    await prisma.emailLog.create({
      data: {
        userId: user.id,
        recipientEmail: user.email,
        subject: "Redefinição de Senha",
        emailType: "PASSWORD_RESET",
        status: "SENT",
      },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
  }
}
