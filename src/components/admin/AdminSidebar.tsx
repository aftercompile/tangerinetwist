"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminHref } from "@/lib/auth/admin-routes";

export function AdminSidebar({ isAdminHost }: { isAdminHost: boolean }) {
  const pathname = usePathname();
  const navLinks = [
    { href: adminHref(isAdminHost, ""), label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: adminHref(isAdminHost, "products"), label: "Products", icon: Package },
    { href: adminHref(isAdminHost, "categories"), label: "Categories", icon: FolderTree },
    { href: adminHref(isAdminHost, "orders"), label: "Orders", icon: ShoppingCart },
    { href: adminHref(isAdminHost, "customers"), label: "Customers", icon: Users },
  ];

  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-charcoal lg:flex">
      <div className="flex h-20 shrink-0 items-center gap-2 px-6">
        <span className="h-2 w-2 rounded-full bg-tangerine-500" />
        <span className="h-display text-lg tracking-tight text-cream">TangerineTwist</span>
      </div>
      <nav className="flex flex-col gap-1 px-4">
        {navLinks.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-tangerine-500 text-white" : "text-cream/70 hover:bg-white/5 hover:text-cream"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
