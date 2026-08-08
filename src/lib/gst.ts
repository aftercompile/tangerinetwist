export interface GstBreakdown {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

// All order/product prices are GST-inclusive (same as the storefront's own "Inclusive of
// all taxes" copy), so the taxable value is backed out of the total rather than added on
// top. CGST+SGST applies when the buyer's state matches the seller's GST-registered
// state; otherwise it's IGST — decided by a case-insensitive string compare, not a state
// code table, so "Maharashtra" must be entered consistently across orders and settings.
export function computeGst(
  total: number,
  buyerState: string | null | undefined,
  sellerState: string,
  ratePercent: number
): GstBreakdown {
  const taxableValue = Math.round(total / (1 + ratePercent / 100));
  const totalTax = total - taxableValue;
  const sameState = !!buyerState && buyerState.trim().toLowerCase() === sellerState.trim().toLowerCase();
  const cgst = sameState ? Math.round(totalTax / 2) : 0;
  const sgst = sameState ? totalTax - cgst : 0;
  const igst = sameState ? 0 : totalTax;
  return { taxableValue, cgst, sgst, igst, totalTax };
}
