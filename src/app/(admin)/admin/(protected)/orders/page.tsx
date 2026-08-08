import Link from "next/link";
import { Upload } from "lucide-react";
import { getAdminOrderRows } from "@/lib/db/admin-queries";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { Button } from "@/components/ui/button";

// Nothing in this page calls a dynamic API (cookies/headers/searchParams), so Next's
// automatic static optimization would otherwise freeze it at build time — admin data
// pages must always execute their DB query fresh, per request.
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrderRows();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{orders.length} orders</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/orders/import">
            <Upload className="h-3.5 w-3.5" /> Import orders
          </Link>
        </Button>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
