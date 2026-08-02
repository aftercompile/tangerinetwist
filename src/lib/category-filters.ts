import type { Product } from "@/lib/types";

// Shared "type:value" filter-chip id scheme, used by CategoryExplorer's
// floating chips and CategoryMoodCollections' mood cards alike, so a mood
// card can pre-apply a real chip filter instead of just being decorative.
// Chips are always computed from whatever products actually have — never a
// hardcoded per-category list — so a future category gets correct chips and
// working mood cards automatically.

export function slugifyTag(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface FilterChipOption {
  id: string;
  label: string;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function computeFilterChips(products: Product[]): FilterChipOption[] {
  const materials = new Map<string, string>();
  const styles = new Set<string>();
  const colors = new Set<string>();
  const sizes = new Set<string>();
  let hasNew = false;
  let hasBestseller = false;

  for (const p of products) {
    materials.set(`material:${slugifyTag(p.material)}`, p.material);
    p.styleTags.forEach((t) => styles.add(t));
    if (p.colorTag) colors.add(p.colorTag);
    if (p.sizeTier) sizes.add(p.sizeTier);
    if (p.badges.includes("new")) hasNew = true;
    if (p.badges.includes("bestseller")) hasBestseller = true;
  }

  const chips: FilterChipOption[] = [];
  materials.forEach((label, id) => chips.push({ id, label }));
  styles.forEach((s) => chips.push({ id: `style:${s}`, label: capitalize(s) }));
  colors.forEach((c) => chips.push({ id: `color:${c}`, label: capitalize(c) }));
  sizes.forEach((s) => chips.push({ id: `size:${s}`, label: capitalize(s) }));
  if (hasNew) chips.push({ id: "badge:new", label: "New" });
  if (hasBestseller) chips.push({ id: "badge:bestseller", label: "Best Seller" });
  return chips;
}

export function productMatchesChip(product: Product, chipId: string): boolean {
  const separatorIndex = chipId.indexOf(":");
  const type = chipId.slice(0, separatorIndex);
  const value = chipId.slice(separatorIndex + 1);
  switch (type) {
    case "material":
      return slugifyTag(product.material) === value;
    case "style":
      return product.styleTags.includes(value);
    case "color":
      return product.colorTag === value;
    case "size":
      return product.sizeTier === value;
    case "badge":
      return (product.badges as string[]).includes(value);
    default:
      return false;
  }
}
