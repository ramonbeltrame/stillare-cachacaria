export const mercadoPagoConfig = {
  publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "",
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
  webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET || "",
};

export function isMercadoPagoConfigured(): boolean {
  return !!(
    process.env.MERCADO_PAGO_ACCESS_TOKEN &&
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY &&
    !process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith("TEST-")
  );
}
