export const FREE_SHIPPING_THRESHOLD = 799;
export const FLAT_SHIPPING_RATE = 79;

export function calculateTotals(subtotal: number) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  return { shipping, total: subtotal + shipping };
}
