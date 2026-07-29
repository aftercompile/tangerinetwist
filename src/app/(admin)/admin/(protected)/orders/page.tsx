import { getAdminOrderRows } from "@/lib/db/admin-queries";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrderRows();
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">{orders.length} orders</p>
      <OrdersTable orders={orders} />
    </div>
  );
}
