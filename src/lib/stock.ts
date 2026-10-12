// Single source of truth for stock status. The values mirror the Postgres `stock_status`
// enum in src/lib/db/schema.ts — keep the two in step when adding one.
export const STOCK_STATUSES = ["in-stock", "made-to-order", "low-stock", "out-of-stock"] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export const STOCK_LABELS: Record<StockStatus, string> = {
  "in-stock": "In Stock",
  "made-to-order": "Made to Order",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

interface Stocked {
  stock: StockStatus;
  variants?: { stock: StockStatus }[];
}

/**
 * Can this product not be bought at all? `out-of-stock` on the product itself is a master
 * switch (it wins even if some variants are marked in stock); a product with variants is
 * also sold out once every one of them is.
 */
export function isProductSoldOut(product: Stocked): boolean {
  if (product.stock === "out-of-stock") return true;
  const variants = product.variants ?? [];
  return variants.length > 0 && variants.every((v) => v.stock === "out-of-stock");
}

/**
 * Can this exact cart line not be bought? Picks the variant's own status when a variant is
 * chosen, but a sold-out product always blocks every one of its variants.
 */
export function isLineSoldOut(product: Stocked, variant?: { stock: StockStatus }): boolean {
  if (product.stock === "out-of-stock") return true;
  if (variant) return variant.stock === "out-of-stock";
  return isProductSoldOut(product);
}

/**
 * Customer-facing message for cart lines that can no longer be bought, or null when every
 * line is fine. Shared by every server-side checkout path so the wording never drifts.
 */
export function soldOutCartMessage(names: string[]): string | null {
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return null;
  const list = unique.length <= 2 ? unique.join(" and ") : `${unique.slice(0, 2).join(", ")} and ${unique.length - 2} more`;
  return unique.length === 1
    ? `${list} is out of stock. Please remove it from your cart to continue.`
    : `${list} are out of stock. Please remove them from your cart to continue.`;
}
