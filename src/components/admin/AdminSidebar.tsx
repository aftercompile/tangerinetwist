"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-charcoal lg:flex">
      <div className="flex h-20 items-center gap-2 px-6">
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
