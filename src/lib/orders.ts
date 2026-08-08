export const FREE_SHIPPING_THRESHOLD = 799;
export const FLAT_SHIPPING_RATE = 79;

export function calculateTotals(subtotal: number) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  return { shipping, total: subtotal + shipping };
}

// Only ever called server-side (order-actions.ts, order-import-actions.ts), but this
// module is also imported client-side for calculateTotals — global crypto.randomUUID()
// (Web Crypto API, available in both Node and the browser) instead of "node:crypto"'s
// import keeps this file safely bundleable for the client, unlike a node: scheme import.
export function generateOrderNumber(): string {
  return `TT-${new Date().toISOString().slice(2, 7).replace("-", "")}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
}
