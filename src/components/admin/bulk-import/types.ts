import type { ProductBadge } from "@/lib/types";

export interface BulkImportVariant {
  tempId: string;
  size: string;
  color: string;
  price?: number;
  stock: "in-stock" | "made-to-order" | "low-stock";
  // Same ordered-array-of-URLs convention as BulkImportRow.images, just scoped to this
  // one variant instead of the whole product.
  images: string[];
  uploadingExtra?: boolean;
}

export interface BulkImportRow {
  tempId: string;
  fileName: string;
  // Ordered — index becomes productImages.position at publish time, same convention
  // ImageListField.tsx uses for the single-product form. images[0] is what the AI draft
  // (generateDraftFromImage) is generated from.
  images: string[];
  status: "uploading" | "generating" | "ready" | "publishing" | "published" | "error";
  error?: string;
  // Uploading an additional photo to an already-"ready" row uses this instead of `status`,
  // so it doesn't reset the drafted copy back into a loading state.
  uploadingExtra?: boolean;
  name: string;
  tagline: string;
  description: string;
  story: string;
  categorySlug: string;
  material: string;
  materials: string[];
  colorway: string;
  features: string[];
  suggestedIcon: string;
  price: number;
  dimensions: string;
  weight: string;
  badges: ProductBadge[];
  variants: BulkImportVariant[];
}
