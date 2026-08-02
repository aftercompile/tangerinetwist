"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Menu, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth-actions";
import { adminHref } from "@/lib/auth/admin-routes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Admin data pages are all force-dynamic (fresh DB read per request), but nothing
// pushes new orders/DB changes into a tab that's already sitting open — without this,
// an admin only sees new data after a manual browser refresh. Polling with
// router.refresh() re-runs the current route's server components in place (no full
// reload, scroll position and open dialogs are preserved) roughly every LIVE_REFRESH_MS.
const LIVE_REFRESH_MS = 15_000;

export function AdminTopbar({ isAdminHost }: { isAdminHost: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLinks = [
    { href: adminHref(isAdminHost, ""), label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: adminHref(isAdminHost, "products"), label: "Products", icon: Package },
    { href: adminHref(isAdminHost, "categories"), label: "Categories", icon: FolderTree },
    { href: adminHref(isAdminHost, "orders"), label: "Orders", icon: ShoppingCart },
    { href: adminHref(isAdminHost, "customers"), label: "Customers", icon: Users },
  ];

  const title =
    navLinks.find((l) => (l.exact ? pathname === l.href : pathname.startsWith(l.href)))?.label ?? "Admin";

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Skip while the tab is backgrounded — no point re-rendering a route nobody's
      // looking at, and it avoids a burst of refreshes firing the instant a stack of
      // background tabs regains focus.
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <header className="flex h-20 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition hover:bg-beige lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent title="Admin menu" side="left" className="max-w-xs">
            <div className="flex items-center gap-2 border-b border-border px-6 py-5">
              <span className="h-2 w-2 rounded-full bg-tangerine-500" />
              <span className="h-display text-lg text-charcoal">TangerineTwist</span>
            </div>
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => {
                const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-tangerine-500 text-white" : "text-charcoal/70 hover:bg-beige hover:text-charcoal"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="h-display text-xl text-charcoal">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <span
          title={`Auto-refreshes every ${LIVE_REFRESH_MS / 1000}s`}
          className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-charcoal/60 sm:flex"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tangerine-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tangerine-500" />
          </span>
          Live
        </span>
        <Button variant="ghost" size="sm" asChild>
          {/* On the admin subdomain, a relative "/" would hit the admin-clean-path
             rewrite (see middleware.ts) and reopen the dashboard instead of the
             storefront — needs an absolute cross-host URL there. */}
          <Link href={isAdminHost ? "https://tangerinetwist.in" : "/"} target="_blank">
            <ExternalLink className="h-4 w-4" /> View Storefront
          </Link>
        </Button>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
