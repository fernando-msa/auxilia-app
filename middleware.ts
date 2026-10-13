import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // As rotas de avisos e calendário do dashboard são murais públicos da comunidade
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/avisos") || pathname.startsWith("/dashboard/calendario")) {
    return NextResponse.next();
  }

  // Rotas administrativas internas sob /dashboard requerem autenticação
  if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/gestao")) {
    const hasAuth = request.cookies.has("__session") || request.cookies.has("auth-token");

    if (!hasAuth) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

