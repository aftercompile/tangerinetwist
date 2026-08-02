export interface BulkImportRow {
  tempId: string;
  fileName: string;
  imageUrl: string;
  status: "uploading" | "generating" | "ready" | "publishing" | "published" | "error";
  error?: string;
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
}
