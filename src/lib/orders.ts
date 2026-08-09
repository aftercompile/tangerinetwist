export const FREE_SHIPPING_THRESHOLD = 799;
export const FLAT_SHIPPING_RATE = 79;

// The set of paymentStatus values that represent money actually committed — "paid"
// (verified Razorpay payment) or "cod" (customer will pay on delivery, set immediately
// at placeOrder time since there's nothing to wait on). "pending" (an online payment
// that was started but never confirmed — an abandoned/incomplete checkout) and "failed"
// are excluded: every revenue/order-count/AOV/LTV query in metrics-queries.ts,
// report-queries.ts, and admin-queries.ts filters to this set, and the admin Orders page
// splits them into a separate "Pending" tab instead of counting them as real orders.
export const PAID_PAYMENT_STATUSES = ["paid", "cod"] as const;

// Shipping is always computed off the raw (pre-discount) subtotal — a coupon can't be
// used to duck under the free-shipping threshold. discountAmount defaults to 0 so every
// existing caller that only passes subtotal keeps getting today's exact numbers back.
export function calculateTotals(subtotal: number, discountAmount = 0) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  return { shipping, discount: discountAmount, total: subtotal - discountAmount + shipping };
}

// Only ever called server-side (order-actions.ts, order-import-actions.ts), but this
// module is also imported client-side for calculateTotals — global crypto.randomUUID()
// (Web Crypto API, available in both Node and the browser) instead of "node:crypto"'s
// import keeps this file safely bundleable for the client, unlike a node: scheme import.
export function generateOrderNumber(): string {
  return `TT-${new Date().toISOString().slice(2, 7).replace("-", "")}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
}
