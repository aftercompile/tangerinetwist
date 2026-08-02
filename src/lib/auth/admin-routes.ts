// Production home for the admin panel — everywhere else this app runs (localhost dev,
// Vercel preview deployments) has no such subdomain, so those keep reaching the admin
// panel at the plain /admin path exactly as before (see src/middleware.ts).
export const ADMIN_HOST = "admin.tangerinetwist.in";

// The fixed, enumerable set of top-level path segments admin.tangerinetwist.in serves
// at a clean URL (e.g. admin.tangerinetwist.in/orders), rewritten in middleware.ts to
// the real /admin/<segment>/... route. Must be kept in sync with the literal entries in
// middleware.ts's `config.matcher` — Next.js requires that array to be statically
// analyzable, so it can't just import this constant.
export const ADMIN_CLEAN_SEGMENTS = ["login", "products", "categories", "customers", "orders"];

// Validates the login form's "from" redirect target against an open-redirect: accepts
// either the clean admin.tangerinetwist.in shape ("/orders/123") or the raw "/admin/..."
// shape (used on localhost/previews, and as a same-host fallback on the subdomain too).
export function isSafeAdminRedirect(path: string): boolean {
  if (!path) return false;
  if (path === "/" || path.startsWith("/admin")) return true;
  const firstSegment = path.split("/")[1] ?? "";
  return ADMIN_CLEAN_SEGMENTS.includes(firstSegment);
}

// Builds a nav href for the admin sidebar/topbar — clean ("/orders") on the admin
// subdomain, raw ("/admin/orders") everywhere else — so the links Link renders always
// match the pathname usePathname() reports on that host (a rewrite is invisible to the
// client, so usePathname() reflects the public URL, not the rewritten /admin/* route).
export function adminHref(isAdminHost: boolean, segment: "" | (typeof ADMIN_CLEAN_SEGMENTS)[number]): string {
  if (isAdminHost) return segment ? `/${segment}` : "/";
  return segment ? `/admin/${segment}` : "/admin";
}
