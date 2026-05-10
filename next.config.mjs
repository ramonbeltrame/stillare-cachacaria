/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.cloudinary.com; font-src 'self'; connect-src 'self' https://*.mercadopago.com https://api.mercadopago.com https://*.correios.com.br https://viacep.com.br; frame-src 'self' https://*.mercadopago.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;";

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: [
        ...securityHeaders,
        { key: "Content-Security-Policy", value: cspHeader.replace(/\n/g, "") },
      ]},
    ];
  },
};

export default nextConfig;
