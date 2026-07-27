export type CategorySlug = "lamps" | "idols" | "desk-organizers";

export interface CategoryMeta {
  slug: CategorySlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  heroIcon: string;
  priceRange: string;
  material: string;
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
  images: ProductImage[];
  icon: string;
  rating: number;
  reviewCount: number;
  badges: Array<"bestseller" | "new" | "limited">;
  features: string[];
  careInstructions: string[];
  shippingInfo: string[];
  returnPolicy: string[];
  faqs: ProductFaq[];
  reviews: ProductReview[];
  relatedSlugs: string[];
  stock: "in-stock" | "made-to-order" | "low-stock";
}
