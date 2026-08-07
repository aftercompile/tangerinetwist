import { format, subDays, addDays, isValid, parseISO } from "date-fns";
import { formatINR } from "@/lib/utils";
import {
  getCheckoutSourceBreakdown,
  getPaymentMethodBreakdown,
  getCustomerRetention,
  getTopCustomersByLtv,
  getReviewAnalytics,
  getCategoryMaterialSellThrough,
} from "@/lib/db/report-queries";
import { StatCard } from "@/components/admin/StatCard";
import { BreakdownDonutChart } from "@/components/admin/charts/BreakdownDonutChart";
import { RatingDistributionChart } from "@/components/admin/charts/RatingDistributionChart";
import { DateRangePicker } from "@/components/admin/reports/DateRangePicker";
import { DownloadCsvButton } from "@/components/admin/reports/DownloadCsvButton";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function resolveRange(from?: string, to?: string) {
  const parsedFrom = from ? parseISO(from) : undefined;
  const parsedTo = to ? parseISO(to) : undefined;
  const validFrom = parsedFrom && isValid(parsedFrom) ? parsedFrom : subDays(new Date(), 30);
  const validTo = parsedTo && isValid(parsedTo) ? parsedTo : new Date();
  return {
    fromStr: format(validFrom, "yyyy-MM-dd"),
    toStr: format(validTo, "yyyy-MM-dd"),
    // End is exclusive in every query (gte(start) && lt(end)) — bump to the start of the
    // next day so the selected "to" day's own orders are included, not cut off at midnight.
    start: validFrom,
    end: addDays(validTo, 1),
  };
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const { fromStr, toStr, start, end } = resolveRange(searchParams.from, searchParams.to);
  const range = { start, end };

  const [checkoutSource, paymentMethod, retention, topCustomers, reviews, sellThrough] = await Promise.all([
    getCheckoutSourceBreakdown(range),
    getPaymentMethodBreakdown(range),
    getCustomerRetention(range),
    getTopCustomersByLtv(10),
    getReviewAnalytics(range),
    getCategoryMaterialSellThrough(range),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-2xl text-charcoal">Reports</h1>
        <DateRangePicker from={fromStr} to={toStr} />
      </div>

      {/* Payment & Checkout */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-charcoal">Payment &amp; Checkout</h3>
            <DownloadCsvButton
              filename={`payment-methods-${fromStr}-to-${toStr}.csv`}
              rows={paymentMethod}
              columns={[
                { key: "method", label: "Method" },
                { key: "orderCount", label: "Orders" },
                { key: "revenue", label: "Revenue" },
              ]}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted">By checkout source</p>
              {checkoutSource.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">No orders in this period.</p>
              ) : (
                <BreakdownDonutChart data={checkoutSource.map((c) => ({ label: c.source, value: c.orderCount }))} />
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted">By payment method</p>
              {paymentMethod.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">No orders in this period.</p>
              ) : (
                <BreakdownDonutChart data={paymentMethod.map((p) => ({ label: p.method, value: p.orderCount }))} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-charcoal">Customers</h3>
            <DownloadCsvButton
              filename={`top-customers-by-ltv.csv`}
              rows={topCustomers}
              columns={[
                { key: "fullName", label: "Name" },
                { key: "email", label: "Email" },
                { key: "orderCount", label: "Orders" },
                { key: "lifetimeValue", label: "Lifetime Value" },
              ]}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="New Customers" value={String(retention.newCustomers)} />
            <StatCard label="Returning Customers" value={String(retention.returningCustomers)} />
            <StatCard label="Repeat Purchase Rate" value={`${retention.repeatPurchaseRatePct.toFixed(1)}%`} />
          </div>
          <p className="mt-4 text-xs font-medium text-muted">Top 10 customers by lifetime value (all-time)</p>
          <ul className="mt-2 flex flex-col divide-y divide-border">
            {topCustomers.length === 0 && <p className="py-6 text-center text-sm text-muted">No customers yet.</p>}
            {topCustomers.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-charcoal">{c.fullName || c.email}</p>
                  <p className="text-xs text-muted">
                    {c.email} · {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="font-medium text-charcoal">{formatINR(c.lifetimeValue)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Reviews & Ratings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-charcoal">Reviews &amp; Ratings</h3>
            <DownloadCsvButton
              filename={`lowest-rated-products.csv`}
              rows={reviews.lowestRatedProducts}
              columns={[
                { key: "name", label: "Product" },
                { key: "slug", label: "Slug" },
                { key: "rating", label: "Rating" },
                { key: "reviewCount", label: "Review Count" },
              ]}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Avg. Rating (period)" value={reviews.avgRatingInPeriod.toFixed(2)} />
            <StatCard label="Total Reviews (period)" value={String(reviews.totalReviews)} />
            <StatCard label="Verified %" value={`${reviews.verifiedPct.toFixed(0)}%`} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted">Rating distribution (period)</p>
              <RatingDistributionChart data={reviews.ratingDistribution} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted">Lowest-rated products (all-time, needs attention)</p>
              <ul className="flex flex-col divide-y divide-border">
                {reviews.lowestRatedProducts.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted">No reviewed products yet.</p>
                )}
                {reviews.lowestRatedProducts.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between py-3 text-sm">
                    <p className="font-medium text-charcoal">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.rating.toFixed(1)} ★ ({p.reviewCount})
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category x Material Sell-Through */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-charcoal">Category × Material Sell-Through</h3>
            <DownloadCsvButton
              filename={`category-material-sell-through-${fromStr}-to-${toStr}.csv`}
              rows={sellThrough}
              columns={[
                { key: "categoryName", label: "Category" },
                { key: "material", label: "Material" },
                { key: "revenue", label: "Revenue" },
                { key: "unitsSold", label: "Units Sold" },
              ]}
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted">
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Material</th>
                  <th className="pb-2 text-right">Units Sold</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sellThrough.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-muted">
                      No orders in this period.
                    </td>
                  </tr>
                )}
                {sellThrough.map((row) => (
                  <tr key={`${row.categoryName}-${row.material}`}>
                    <td className="py-2 text-charcoal">{row.categoryName}</td>
                    <td className="py-2 text-charcoal">{row.material}</td>
                    <td className="py-2 text-right text-charcoal">{row.unitsSold}</td>
                    <td className="py-2 text-right font-medium text-charcoal">{formatINR(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
