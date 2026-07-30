import { getAdminOrderRows } from "@/lib/db/admin-queries";
import { OrdersTable } from "@/components/admin/OrdersTable";

// Nothing in this page calls a dynamic API (cookies/headers/searchParams), so Next's
// automatic static optimization would otherwise freeze it at build time — admin data
// pages must always execute their DB query fresh, per request.
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrderRows();
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">{orders.length} orders</p>
      <OrdersTable orders={orders} />
    </div>
  );
}
