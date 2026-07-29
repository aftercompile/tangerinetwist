import { z } from "zod";
import { iconMap } from "@/components/shared/icon-map";

const iconNames = Object.keys(iconMap) as [string, ...string[]];
const toneEnum = z.enum(["warm", "cool", "charcoal", "beige"]);

const nonEmptyStringList = z.array(z.string().trim().min(1)).default([]);

export const productImageSchema = z.object({
  id: z.string().optional(),
  src: z.string().min(1, "Upload an image or remove this slot"),
  alt: z.string().default(""),
  tone: toneEnum,
  icon: z.enum(iconNames),
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
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().int().positive().optional().nullable(),
  material: z.string().trim().min(1, "Material is required"),
  materials: nonEmptyStringList,
  dimensions: z.string().trim().min(1, "Dimensions are required"),
  weight: z.string().trim().min(1, "Weight is required"),
  colorway: z.string().trim().min(1, "Colorway is required"),
  finishTime: z.string().trim().min(1, "Finish time is required"),
  icon: z.enum(iconNames),
  badges: z.array(z.enum(["bestseller", "new", "limited"])).default([]),
  features: nonEmptyStringList,
  careInstructions: nonEmptyStringList,
  shippingInfo: nonEmptyStringList,
  returnPolicy: nonEmptyStringList,
  faqs: z.array(productFaqSchema).default([]),
  stock: z.enum(["in-stock", "made-to-order", "low-stock"]),
  isPersonalized: z.boolean().default(false),
  images: z.array(productImageSchema).min(1, "Add at least one image"),
  relatedProductIds: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
