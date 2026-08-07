import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, FileBarChart, type LucideIcon } from "lucide-react";
import { adminHref } from "@/lib/auth/admin-routes";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

// Shared by AdminSidebar (desktop rail) and AdminTopbar (mobile sheet) so the two nav
// lists — previously defined verbatim in both files — can't drift apart.
export function getAdminNavLinks(isAdminHost: boolean): AdminNavLink[] {
  return [
    { href: adminHref(isAdminHost, ""), label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: adminHref(isAdminHost, "products"), label: "Products", icon: Package },
    { href: adminHref(isAdminHost, "categories"), label: "Categories", icon: FolderTree },
    { href: adminHref(isAdminHost, "orders"), label: "Orders", icon: ShoppingCart },
    { href: adminHref(isAdminHost, "customers"), label: "Customers", icon: Users },
    { href: adminHref(isAdminHost, "reports"), label: "Reports", icon: FileBarChart },
  ];
}
