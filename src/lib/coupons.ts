export function calculateDiscount(
  subtotal: number,
  discountType: "percentage" | "flat",
  discountValue: number
): number {
  const raw = discountType === "percentage" ? Math.round((subtotal * discountValue) / 100) : discountValue;
  return Math.min(raw, subtotal);
}
