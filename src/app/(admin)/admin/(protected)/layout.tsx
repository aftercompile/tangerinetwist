import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ADMIN_HOST } from "@/lib/auth/admin-routes";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Computed once here (not inside the client nav components) so server-rendered and
  // hydrated markup always agree — usePathname() in those components reflects the
  // public URL, so their nav hrefs need to already match it on first paint.
  const isAdminHost = headers().get("host") === ADMIN_HOST;

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <AdminSidebar isAdminHost={isAdminHost} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar isAdminHost={isAdminHost} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
