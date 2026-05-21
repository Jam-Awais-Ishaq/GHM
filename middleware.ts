import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/config/routes";
import { canAccessAdminRoute } from "@/lib/auth/redirects";
import { getSessionFromRequest } from "@/lib/auth/session";

const ADMIN_PREFIXES = [routes.submissions];
const AUTH_REQUIRED_PREFIXES = [routes.profile];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionFromRequest(request);
  const isAdminRoute = ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const requiresAuth = AUTH_REQUIRED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (requiresAuth && !session) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !canAccessAdminRoute(session)) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === routes.login && session) {
    const dest = canAccessAdminRoute(session) ? routes.submissions : routes.map;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/submissions/:path*", "/profile/:path*", "/login", "/auth/verify"],
};
