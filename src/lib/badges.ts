// Shared between ProductForm.tsx and DraftCard.tsx (bulk import) so both badge pickers
// stay in sync with productFormSchema's badges enum (src/lib/validation/product.ts)
// instead of maintaining two copies of the same label list.
export const badgeOptions = [
  { value: "bestseller", label: "Best Seller" },
  { value: "new", label: "New" },
  { value: "limited", label: "Limited Batch" },
  { value: "artist-pick", label: "Artist Pick" },
  { value: "hand-finished", label: "Hand Finished" },
  { value: "signature", label: "Signature Collection" },
  { value: "premium-finish", label: "Premium Finish" },
] as const;
