"use server";

import { requireAdminSession } from "@/lib/auth/guard";
import { getAdminCategoryOptions, getAdminProductRows } from "@/lib/db/admin-queries";
import { generateProductDraft } from "@/lib/gemini/client";
import { iconMap } from "@/components/shared/icon-map";
import {
  lampCare,
  idolCare,
  deskCare,
  shippingStandard,
  returnsStandard,
  idolFeatures,
  deskFeatures,
  faqs,
} from "@/data/products";

export interface BulkDraft {
  imageUrl: string;
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
  suggestedPrice: number;
}

// Category-level boilerplate the AI never generates per product — reused verbatim from
// the same constants the seed fixture uses, so bulk-imported products carry the exact
// same operational copy as hand-entered ones. "lamps" has no shared features template
// (each lamp's features are hand-written in the fixture), so it falls back to the
// AI-drafted features for that one category only.
function careFor(categorySlug: string): string[] {
  if (categorySlug === "lamps") return lampCare;
  if (categorySlug === "idols") return idolCare;
  return deskCare;
}

function baseFeaturesFor(categorySlug: string): string[] | null {
  if (categorySlug === "idols") return idolFeatures;
  if (categorySlug === "desk-organizers") return deskFeatures;
  return null;
}

export async function generateDraftFromImage(imageUrl: string): Promise<{ draft?: BulkDraft; error?: string }> {
  await requireAdminSession();

  try {
    const [categories, productRows] = await Promise.all([getAdminCategoryOptions(), getAdminProductRows()]);

    const priceRanges: Record<string, { min: number; max: number }> = {};
    for (const row of productRows) {
      const range = priceRanges[row.categorySlug];
      if (!range) {
        priceRanges[row.categorySlug] = { min: row.price, max: row.price };
      } else {
        range.min = Math.min(range.min, row.price);
        range.max = Math.max(range.max, row.price);
      }
    }

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Could not fetch the uploaded image back for analysis.");
    const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await imageRes.arrayBuffer());

    const draft = await generateProductDraft({
      imageBase64: buffer.toString("base64"),
      mimeType,
      categoryOptions: categories.map((c) => ({ slug: c.slug, name: c.name })),
      iconOptions: Object.keys(iconMap),
      priceRanges,
    });

    return {
      draft: {
        imageUrl,
        name: draft.name,
        tagline: draft.tagline,
        description: draft.description,
        story: draft.story,
        categorySlug: draft.categorySlug,
        material: draft.material,
        materials: draft.materials,
        colorway: draft.colorway,
        features: baseFeaturesFor(draft.categorySlug) ?? draft.features,
        suggestedIcon: draft.suggestedIcon,
        suggestedPrice: draft.suggestedPrice,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate a draft for this image." };
  }
}

// Exposed so the client can assemble the rest of ProductFormValues (careInstructions,
// shippingInfo, returnPolicy, faqs) from the same single source of truth as the seed
// fixture, without duplicating this boilerplate in a client component.
export async function getBulkImportDefaults(categorySlug: string) {
  await requireAdminSession();
  return {
    careInstructions: careFor(categorySlug),
    shippingInfo: shippingStandard,
    returnPolicy: returnsStandard,
    faqs: faqs(),
  };
}
