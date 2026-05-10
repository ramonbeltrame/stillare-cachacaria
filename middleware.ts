import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Admin routes: redirect to admin login if not authenticated
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Client routes: require customer login
  if (
    pathname.startsWith("/minha-conta") ||
    pathname.startsWith("/meus-pedidos") ||
    pathname.startsWith("/enderecos") ||
    pathname.startsWith("/favoritos") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/carrinho")
  ) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/minha-conta/:path*",
    "/meus-pedidos/:path*",
    "/enderecos/:path*",
    "/favoritos/:path*",
    "/favoritos",
    "/checkout",
    "/carrinho",
  ],
};
