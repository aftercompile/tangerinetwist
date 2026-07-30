import { z } from "zod";
import { iconMap } from "@/components/shared/icon-map";

const iconNames = Object.keys(iconMap) as [string, ...string[]];
const toneEnum = z.enum(["warm", "cool", "charcoal", "beige"], "Choose a tone");

const nonEmptyStringList = z.array(z.string().trim().min(1)).default([]);

// Rounds before checking positivity rather than requiring an exact integer: a native
// <input type="number"> has no built-in guard against a stray decimal (browser scroll
// deltas, paste, etc.), and a fractional rupee is never actually meaningful here — it
// should just be treated as the nearest whole number, not rejected outright.
function priceSchema(message: string) {
  return z.coerce
    .number("Enter a valid price")
    .transform((n) => Math.round(n))
    .pipe(z.number().positive(message));
}

export const productImageSchema = z.object({
  id: z.string().optional(),
  // Intentionally optional: an empty src is a real, common state — it means "use the
  // generated placeholder art" (see ProductImagePlaceholder), not a missing upload.
  // Requiring every image slot to have a real photo would block editing any product
  // that hasn't had professional photography shot for it yet.
  src: z.string().default(""),
  alt: z.string().default(""),
  tone: toneEnum,
  icon: z.enum(iconNames, "Choose an icon"),
});

export const productFaqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
});

export const productFormSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(1, "Name is required"),
  tagline: z.string().trim().min(1, "Tagline is required"),
  description: z.string().trim().min(1, "Description is required"),
  story: z.string().trim().min(1, "Story is required"),
  price: priceSchema("Price must be greater than 0"),
  // Coerced independently of whatever the form sends for "no compare-at price". Three
  // sentinels all mean "not set": "" and null (defensive), and critically 0 —
  // react-hook-form does NOT run a number input's setValueAs transform on an
  // untouched/empty field at submit time; it applies its own type="number" coercion
  // first, which reads an empty input as 0 (confirmed empirically with a real
  // react-hook-form + jsdom submission: an untouched field with defaultValue null
  // submits as the number 0, never reaching setValueAs at all). 0 is never a
  // meaningful compare-at price regardless — positive() already rejects it as a real
  // value — so treating it as "not set" costs nothing and fixes this at the root.
  compareAtPrice: z.preprocess(
    (v) => (v === "" || v === undefined || v === 0 ? null : v),
    priceSchema("Compare-at price must be greater than 0").nullable()
  ),
  material: z.string().trim().min(1, "Material is required"),
  materials: nonEmptyStringList,
  dimensions: z.string().trim().min(1, "Dimensions are required"),
  weight: z.string().trim().min(1, "Weight is required"),
  colorway: z.string().trim().min(1, "Colorway is required"),
  finishTime: z.string().trim().min(1, "Finish time is required"),
  icon: z.enum(iconNames, "Choose an icon"),
  badges: z.array(z.enum(["bestseller", "new", "limited"], "Invalid badge")).default([]),
  features: nonEmptyStringList,
  careInstructions: nonEmptyStringList,
  shippingInfo: nonEmptyStringList,
  returnPolicy: nonEmptyStringList,
  faqs: z.array(productFaqSchema).default([]),
  stock: z.enum(["in-stock", "made-to-order", "low-stock"], "Choose a stock status"),
  isPersonalized: z.boolean().default(false),
  // At least one image slot must exist — ProductGallery indexes images[0] directly and
  // would crash on an empty array — but each slot's src may be empty (placeholder art).
  images: z.array(productImageSchema).min(1, "Add at least one image"),
  relatedProductIds: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
