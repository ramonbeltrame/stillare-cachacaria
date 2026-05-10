/**
 * Security utilities for Stillare E-commerce
 * Rate limiting, input sanitization, anti-tampering checks
 */

// ─── In-Memory Rate Limiter ─────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((entry, key) => {
      if (now > entry.resetAt) keysToDelete.push(key);
    });
    keysToDelete.forEach((key) => rateLimitMap.delete(key));
  }, 60000);
}

export function rateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// ─── Rate Limiters for specific routes ──────────────────
export function loginRateLimit(ip: string) {
  return rateLimit(`login:${ip}`, 10, 15 * 60 * 1000); // 10 per 15 min
}

export function registerRateLimit(ip: string) {
  return rateLimit(`register:${ip}`, 5, 60 * 60 * 1000); // 5 per hour
}

export function forgotPasswordRateLimit(ip: string) {
  return rateLimit(`forgot:${ip}`, 3, 30 * 60 * 1000); // 3 per 30 min
}

export function apiGeneralRateLimit(ip: string) {
  return rateLimit(`api:${ip}`, 100, 60 * 1000); // 100 per minute
}

export function webhookRateLimit(sourceIp: string) {
  return rateLimit(`webhook:${sourceIp}`, 30, 60000); // 30 per minute from same IP
}

// ─── Input Sanitization ─────────────────────────────────
const XSS_PATTERNS = /<script\b[^>]*>([\s\S]*?)<\/script>|<[^>]*on\w+\s*=|javascript:/gi;
const SQL_INJECTION_PATTERNS = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|TRUNCATE)\b)/gi;

export function sanitizeInput(input: string): string {
  if (!input) return "";
  let cleaned = input
    .replace(XSS_PATTERNS, "")
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
  // Truncate to max 5000 chars to prevent DoS
  return cleaned.slice(0, 5000);
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function containsDangerousContent(input: string): boolean {
  return XSS_PATTERNS.test(input) || SQL_INJECTION_PATTERNS.test(input);
}

// ─── Idempotency Key ────────────────────────────────────
const processedKeys = new Map<string, { result: any; timestamp: number }>();

// Cleanup old keys
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    processedKeys.forEach((entry, key) => {
      if (now - entry.timestamp > 86400000) keysToDelete.push(key);
    });
    keysToDelete.forEach((key) => processedKeys.delete(key));
  }, 300000);
}

export function getIdempotencyResult(key: string): any | null {
  const entry = processedKeys.get(key);
  if (entry && Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
    return entry.result;
  }
  return null;
}

export function setIdempotencyResult(key: string, result: any): void {
  processedKeys.set(key, { result, timestamp: Date.now() });
}

// ─── Transaction Reference Generator ────────────────────
export function generateTransactionReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "TX-";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ─── IP Extractor ───────────────────────────────────────
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

// ─── Allowed Upload Types ────────────────────────────────
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase());
}

export function isValidImageExtension(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}

// ─── CSRF Token Validation ──────────────────────────────
export function validateCsrfToken(request: Request, token: string): boolean {
  const cookieToken = request.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("next-auth.csrf-token="))
    ?.split("=")[1]
    ?.split("|")[0];

  return !!cookieToken && cookieToken === token;
}

// ─── Amount Bounds Check ─────────────────────────────────
export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount < 1000000 && Number.isFinite(amount);
}

// ─── Rate Limit Response Helper ─────────────────────────
export function rateLimitResponse(resetAt: number): Response {
  return new Response(
    JSON.stringify({
      error: "Muitas requisições. Tente novamente mais tarde.",
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        "X-RateLimit-Reset": String(resetAt),
      },
    }
  );
}
