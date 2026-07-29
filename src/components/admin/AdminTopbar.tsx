"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Menu, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
};

export function AdminTopbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([href]) => pathname.startsWith(href) && href !== "/admin")?.[1] ??
    "Admin";

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
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" target="_blank">
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
