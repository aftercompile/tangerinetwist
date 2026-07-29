import { z } from "zod";

export const categoryFormSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(1, "Name is required"),
  shortName: z.string().trim().min(1, "Short name is required"),
  tagline: z.string().trim().min(1, "Tagline is required"),
  description: z.string().trim().min(1, "Description is required"),
  heroIcon: z.string().trim().min(1, "Hero icon is required"),
  material: z.string().trim().min(1, "Material is required"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
