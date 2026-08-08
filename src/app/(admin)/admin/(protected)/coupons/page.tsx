import { getAdminCouponRows } from "@/lib/db/admin-queries";
import { CouponsManager } from "@/components/admin/CouponsManager";

// Admin data pages must always execute their DB query fresh, per request — see the same
// note on every other admin list page (orders/page.tsx, categories/page.tsx, ...).
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCouponRows();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h-display text-2xl text-charcoal">Coupons</h1>
        <p className="text-sm text-muted">Create and manage discount codes redeemable at checkout.</p>
      </div>
      <CouponsManager coupons={coupons} />
    </div>
  );
}
