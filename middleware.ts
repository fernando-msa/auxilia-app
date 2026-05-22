import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Proteger rotas de dashboard
  if (pathname.startsWith("/dashboard")) {
    // Verificar se há token de autenticação (este é um check básico)
    // Em produção, você pode verificar tokens mais robustos
    const hasAuth = request.cookies.has("__session") || request.cookies.has("auth-token");

    // Se não há autenticação, redirecionar para login
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
