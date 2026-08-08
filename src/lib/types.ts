// Widened from a closed union now that categories are DB rows an admin can add to.
export type CategorySlug = string;

export interface CategoryStat {
  label: string;
  icon: string;
}

export interface CategoryMeta {
  slug: CategorySlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  heroIcon: string;
  priceRange: string;
  material: string;
  // Editorial category-page content — all default to "" / [] / null when unset, and every
  // section that reads them renders nothing rather than an empty block in that case.
  heroStatement: string;
  storyTitle: string;
  storyBody: string;
  storyImage?: string;
  journeySteps: string[];
  stats: CategoryStat[];
  lifestyleImage?: string;
  lifestyleHeadline: string;
  lifestyleBody: string;
  closingImage?: string;
  closingHeadline: string;
  closingBody: string;
}

export interface ProductReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ProductImage {
  id: string;
  alt: string;
  tone: "warm" | "cool" | "charcoal" | "beige";
  icon: string;
  src?: string;
}

export type ProductBadge =
  | "bestseller"
  | "new"
  | "limited"
  | "artist-pick"
  | "hand-finished"
  | "signature"
  | "premium-finish";

// A purchasable size/color option. price/stock are per-variant; price undefined means
// "use the parent product's price". images are this variant's own dedicated photos —
// falls back to the product's shared images when empty (see ProductGallery usage).
export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  sku?: string;
  price?: number;
  stock: "in-stock" | "made-to-order" | "low-stock";
  images: ProductImage[];
}

export interface Product {
  id: string;
  slug: string;
  category: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  story: string;
  price: number;
  compareAtPrice?: number;
  currency: "INR";
  material: string;
  materials: string[];
  dimensions: string;
  weight: string;
  colorway: string;
  finishTime: string;
  // Shared/general photos only — a variant's own dedicated photos live on variants[].images.
  images: ProductImage[];
  // Empty/absent = no variants; every other layer (cart/checkout/admin) treats that as
  // today's single-price/single-stock behavior, unchanged. Optional (like isPersonalized
  // below) because the static seed fixture in src/data/products.ts doesn't set it — the DB
  // query layer always does.
  variants?: ProductVariant[];
  icon: string;
  rating: number;
  reviewCount: number;
  badges: ProductBadge[];
  // Floating filter-chip facets — computed dynamically per category from whatever values
  // are actually present, never a hardcoded per-category list (see FilterChips.tsx).
  styleTags: string[];
  colorTag?: string;
  sizeTier?: string;
  features: string[];
  careInstructions: string[];
  shippingInfo: string[];
  returnPolicy: string[];
  faqs: ProductFaq[];
  reviews: ProductReview[];
  relatedSlugs: string[];
  stock: "in-stock" | "made-to-order" | "low-stock";
  createdAt: string;
  // Optional: absent on the static seed fixture in src/data/products.ts, always set by the DB query layer.
  isPersonalized?: boolean;
}
