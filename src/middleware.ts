import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { ADMIN_CLEAN_SEGMENTS, ADMIN_HOST } from "@/lib/auth/admin-routes";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ACCOUNT_PATHS = ["/account/login", "/account/signup", "/account/reset-password"];

const PRODUCTION_MAIN_HOSTS = ["tangerinetwist.in", "www.tangerinetwist.in"];

// Shared by both the admin-subdomain and the raw-path (localhost/preview) cases below —
// internalPathname is always a real /admin/... route by the time this runs.
async function guardAdmin(request: NextRequest, internalPathname: string): Promise<NextResponse> {
  if (internalPathname === "/admin/login") {
    return rewriteTo(request, internalPathname);
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    const loginPath = request.headers.get("host") === ADMIN_HOST ? "/login" : "/admin/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return rewriteTo(request, internalPathname);
}

function rewriteTo(request: NextRequest, pathname: string): NextResponse {
  if (pathname === request.nextUrl.pathname) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // Production main domain: fold the old path-based admin URL into its subdomain home.
  if (PRODUCTION_MAIN_HOSTS.includes(host) && pathname.startsWith("/admin")) {
    const target = new URL(request.url);
    // .host alone won't clear an existing port (e.g. in local testing with :3000) —
    // hostname + explicit empty port is the only combination that reliably drops it.
    target.hostname = ADMIN_HOST;
    target.port = "";
    target.pathname = pathname === "/admin" ? "/" : pathname.slice("/admin".length) || "/";
    return NextResponse.redirect(target);
  }

  if (host === ADMIN_HOST) {
    const firstSegment = pathname.split("/")[1] ?? "";
    const isCleanAdminPath = pathname === "/" || ADMIN_CLEAN_SEGMENTS.includes(firstSegment);
    const isRawAdminPath = pathname.startsWith("/admin");

    if (isCleanAdminPath || isRawAdminPath) {
      const internalPathname = isRawAdminPath ? pathname : pathname === "/" ? "/admin" : `/admin${pathname}`;
      return guardAdmin(request, internalPathname);
    }

    // Anything else on the admin host (api/*, _next/*, favicon, etc.) — leave alone.
    // Per CLAUDE.md, middleware here is routing convenience, not the security boundary;
    // every mutating action re-checks its own session independently regardless of host.
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    // Non-production host (localhost, preview deployments) — unchanged direct access.
    return guardAdmin(request, pathname);
  }

  // /account/* — refresh the Supabase session on every request (access tokens expire
  // after ~1hr) via the response updateSession returns, and guard everything except the
  // sign-in/sign-up/request-reset pages.
  if (pathname.startsWith("/account")) {
    const { response, user } = await updateSession(request);
    if (!PUBLIC_ACCOUNT_PATHS.includes(pathname) && !user) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    // Kept in sync with ADMIN_CLEAN_SEGMENTS in src/lib/auth/admin-routes.ts — only
    // matters on the admin.tangerinetwist.in host, where these clean paths need the
    // middleware to run at all so they can be rewritten to their real /admin/* route.
    "/",
    "/login",
    "/products/:path*",
    "/categories/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/reports/:path*",
    "/tax/:path*",
  ],
};
