export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("[EMAIL DEV] To:", to, "Subject:", subject);
    return { success: true, dev: true };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: {
        email: process.env.EMAIL_FROM || "noreply@stillare.com.br",
        name: process.env.EMAIL_FROM_NAME || "Stillare Cachaçaria",
      },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    console.error("[EMAIL ERROR]", await response.text());
    return { success: false, error: response.statusText };
  }

  return { success: true };
}

export function getEmailTemplate(type: string, data: Record<string, any>): string {
  switch (type) {
    case "welcome":
      return welcomeTemplate(data);
    case "verification":
      return verificationTemplate(data);
    case "order-confirmation":
      return orderConfirmationTemplate(data);
    case "order-shipped":
      return orderShippedTemplate(data);
    case "order-delivered":
      return orderDeliveredTemplate(data);
    case "password-reset":
      return passwordResetTemplate(data);
    case "invoice":
      return invoiceTemplate(data);
    default:
      return "";
  }
}

function welcomeTemplate(data: any) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#1a0f07;color:#e8d5c0;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="color:#d4a853;text-align:center;font-size:28px">Bem-vindo(a) à Stillare</h1>
  <p style="font-size:16px;line-height:1.6">Olá, <strong>${data.fullName}</strong>!</p>
  <p style="font-size:16px;line-height:1.6">Sua conta na Stillare Cachaçaria foi criada com sucesso. Agora você pode explorar nossa coleção de cachaças artesanais e fazer seus pedidos com segurança.</p>
  ${data.verificationLink ? `<p style="text-align:center;margin:30px 0"><a href="${data.verificationLink}" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Verificar E-mail</a></p>` : ""}
  <p style="text-align:center;margin:30px 0"><a href="${data.appUrl}/produtos" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Explorar Produtos</a></p>
  <hr style="border-color:#3d2b15;margin:30px 0">
  <p style="font-size:12px;color:#8b7355;text-align:center">Stillare Cachaçaria — Charqueada, SP<br>🔞 Proibido para menores de 18 anos</p>
</body></html>`;
}

function verificationTemplate(data: any) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#1a0f07;color:#e8d5c0;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="color:#d4a853;text-align:center">Verifique seu e-mail</h1>
  <p>Olá, <strong>${data.fullName}</strong>!</p>
  <p>Clique no botão abaixo para verificar seu endereço de e-mail:</p>
  <p style="text-align:center;margin:30px 0"><a href="${data.verificationLink}" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Verificar E-mail</a></p>
  <p style="font-size:14px;color:#8b7355">Se você não criou esta conta, ignore este e-mail.</p>
</body></html>`;
}

function orderConfirmationTemplate(data: any) {
  const items = data.items || [];
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#1a0f07;color:#e8d5c0;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="color:#d4a853;text-align:center">Pedido Confirmado! 🎉</h1>
  <p>Olá, <strong>${data.fullName}</strong>!</p>
  <p>Seu pedido <strong>${data.orderNumber}</strong> foi confirmado e está sendo processado.</p>
  <div style="background:#2d1a0a;padding:20px;border-radius:8px;margin:20px 0">
    <h3 style="color:#d4a853">Resumo do Pedido</h3>
    ${items.map((item: any) => `<p style="margin:8px 0">${item.productName} x${item.quantity} — R$ ${Number(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}</p>`).join("")}
    <hr style="border-color:#3d2b15">
    <p>Subtotal: R$ ${Number(data.subtotal).toFixed(2).replace(".", ",")}</p>
    <p>Frete: R$ ${Number(data.shippingCost).toFixed(2).replace(".", ",")}</p>
    <p style="font-size:18px;color:#d4a853"><strong>Total: R$ ${Number(data.totalAmount).toFixed(2).replace(".", ",")}</strong></p>
  </div>
  <p style="text-align:center;margin:30px 0"><a href="${data.appUrl}/meus-pedidos/${data.orderId}" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Acompanhar Pedido</a></p>
  <p>Sua Nota Fiscal será enviada em breve por e-mail.</p>
  <hr style="border-color:#3d2b15">
  <p style="font-size:12px;color:#8b7355;text-align:center">🔞 Proibido para menores de 18 anos</p>
</body></html>`;
}

function orderShippedTemplate(data: any) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#1a0f07;color:#e8d5c0;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="color:#d4a853;text-align:center">Seu pedido saiu para entrega! 📦</h1>
  <p>Olá, <strong>${data.fullName}</strong>!</p>
  <p>Seu pedido <strong>${data.orderNumber}</strong> foi enviado.</p>
  <div style="background:#2d1a0a;padding:20px;border-radius:8px;margin:20px 0">
    <p><strong>Código de Rastreamento:</strong> ${data.trackingCode}</p>
    <p><strong>Transportadora:</strong> Correios</p>
    <p><strong>Previsão de Entrega:</strong> ${data.estimatedDelivery}</p>
  </div>
  <p style="text-align:center;margin:30px 0"><a href="https://rastreamento.correios.com.br/app/index.php" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Rastrear Pedido</a></p>
  <hr style="border-color:#3d2b15">
  <p style="font-size:12px;color:#8b7355;text-align:center">🔞 Proibido para menores de 18 anos</p>
</body></html>`;
}

function orderDeliveredTemplate(data: any) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#1a0f07;color:#e8d5c0;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="color:#d4a853;text-align:center">Pedido Entregue! 🥃</h1>
  <p>Olá, <strong>${data.fullName}</strong>!</p>
  <p>Seu pedido <strong>${data.orderNumber}</strong> foi entregue com sucesso.</p>
  <p>Aproveite com moderação e volte sempre!</p>
  <p style="text-align:center;margin:30px 0"><a href="${data.appUrl}/produtos" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Comprar Novamente</a></p>
  <hr style="border-color:#3d2b15">
  <p style="font-size:12px;color:#8b7355;text-align:center">🔞 Proibido para menores de 18 anos</p>
</body></html>`;
}

function passwordResetTemplate(data: any) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#1a0f07;color:#e8d5c0;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="color:#d4a853;text-align:center">Redefinição de Senha</h1>
  <p>Olá, <strong>${data.fullName}</strong>!</p>
  <p>Você solicitou a redefinição de sua senha.</p>
  <p style="text-align:center;margin:30px 0"><a href="${data.resetLink}" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Redefinir Senha</a></p>
  <p style="font-size:14px;color:#8b7355">Este link é válido por 1 hora. Se você não solicitou a redefinição, ignore este e-mail.</p>
</body></html>`;
}

function invoiceTemplate(data: any) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#1a0f07;color:#e8d5c0;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="color:#d4a853;text-align:center">Nota Fiscal Eletrônica</h1>
  <p>Olá, <strong>${data.fullName}</strong>!</p>
  <p>A Nota Fiscal do seu pedido <strong>${data.orderNumber}</strong> foi emitida.</p>
  <div style="background:#2d1a0a;padding:20px;border-radius:8px;margin:20px 0">
    <p><strong>NFe Nº:</strong> ${data.nfeNumber}</p>
    <p><strong>Chave de Acesso:</strong> ${data.nfeKey}</p>
  </div>
  ${data.pdfUrl ? `<p style="text-align:center;margin:20px 0"><a href="${data.pdfUrl}" style="background:#d4a853;color:#1a0f07;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold">Baixar PDF da NFe</a></p>` : ""}
  <p style="font-size:14px;color:#8b7355">Guarde este documento para fins de garantia e declaração de IR.</p>
</body></html>`;
}
