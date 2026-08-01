import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  rating: z.number().int().min(1, "Choose a rating").max(5),
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Review is required").max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
