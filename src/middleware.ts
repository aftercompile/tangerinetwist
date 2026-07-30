import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { updateSession } from "@/lib/supabase/middleware";

// Pages reachable while signed out — everything else under /account requires a session
// (a normal signed-in session, or the temporary recovery session /auth/confirm sets up).
const PUBLIC_ACCOUNT_PATHS = ["/account/login", "/account/signup", "/account/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const valid = await verifySessionToken(token);

    if (!valid) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // /account/* — refresh the Supabase session on every request (access tokens expire
  // after ~1hr) via the response updateSession returns, and guard everything except the
  // sign-in/sign-up/request-reset pages.
  const { response, user } = await updateSession(request);

  if (!PUBLIC_ACCOUNT_PATHS.includes(pathname) && !user) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
