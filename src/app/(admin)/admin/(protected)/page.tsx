import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";
import {
  getKpis,
  getLowStockProducts,
  getOrderStatusBreakdown,
  getRecentOrders,
  getRevenueByCategory,
  getRevenueOverTime,
  getTopProducts,
} from "@/lib/db/metrics-queries";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { CategoryRevenueChart } from "@/components/admin/charts/CategoryRevenueChart";
import { StatusBreakdownChart } from "@/components/admin/charts/StatusBreakdownChart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PERIODS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "12 months", value: "365" },
] as const;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = PERIODS.some((p) => p.value === searchParams.period) ? searchParams.period! : "30";
  const days = Number(period);

  const [kpis, revenueOverTime, revenueByCategory, statusBreakdown, topProducts, lowStock, recentOrders] =
    await Promise.all([
      getKpis(days),
      getRevenueOverTime(days),
      getRevenueByCategory(days),
      getOrderStatusBreakdown(days),
      getTopProducts(days),
      getLowStockProducts(),
      getRecentOrders(10),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-1 rounded-full border border-border bg-warm-white p-1 w-fit">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/admin?period=${p.value}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              period === p.value ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-beige"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-tangerine-200 bg-tangerine-50 px-5 py-3 text-sm text-tangerine-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            {lowStock.length} product{lowStock.length > 1 ? "s are" : " is"} low on stock:{" "}
            {lowStock.map((p, i) => (
              <span key={p.id}>
                <Link href={`/admin/products/${p.id}/edit`} className="font-medium underline">
                  {p.name}
                </Link>
                {i < lowStock.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatINR(kpis.current.revenue)} deltaPct={kpis.deltaPct.revenue ?? undefined} />
        <StatCard label="Orders" value={String(kpis.current.orderCount)} deltaPct={kpis.deltaPct.orderCount ?? undefined} />
        <StatCard label="Avg. Order Value" value={formatINR(Math.round(kpis.current.aov))} deltaPct={kpis.deltaPct.aov ?? undefined} />
        <StatCard label="Units Sold" value={String(kpis.current.unitsSold)} deltaPct={kpis.deltaPct.unitsSold ?? undefined} />
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-display text-lg text-charcoal">Revenue Over Time</h3>
          <div className="mt-4">
            <RevenueChart data={revenueOverTime} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg text-charcoal">Revenue by Category</h3>
            <div className="mt-4">
              {revenueByCategory.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">No orders in this period.</p>
              ) : (
                <CategoryRevenueChart data={revenueByCategory} />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg text-charcoal">Order Status Breakdown</h3>
            <div className="mt-4">
              {statusBreakdown.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">No orders in this period.</p>
              ) : (
                <StatusBreakdownChart data={statusBreakdown} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg text-charcoal">Top Products</h3>
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {topProducts.length === 0 && <p className="py-6 text-center text-sm text-muted">No sales yet.</p>}
              {topProducts.map((p) => (
                <li key={p.productId ?? p.slug} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-charcoal">{p.name}</p>
                    <p className="text-xs text-muted">{p.unitsSold} units sold</p>
                  </div>
                  <p className="font-medium text-charcoal">{formatINR(p.revenue)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-charcoal">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs font-medium text-tangerine-600 hover:underline">
                View all
              </Link>
            </div>
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-charcoal hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-muted">{o.customerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{o.status.replace("_", " ")}</Badge>
                    <span className="font-medium text-charcoal">{formatINR(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
