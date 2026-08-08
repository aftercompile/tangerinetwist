import { z } from "zod";

export const couponFormSchema = z
  .object({
    id: z.string().optional(),
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .transform((v) => v.toUpperCase())
      .pipe(z.string().regex(/^[A-Z0-9]+$/, "Use letters and numbers only")),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.coerce.number().int().positive("Discount value must be greater than 0"),
    minOrderValue: z.coerce.number().int().min(0).default(0),
    // Blank in the form means "unlimited" — coerced to undefined rather than 0, since 0
    // uses would mean the coupon could never be redeemed.
    maxUses: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : v),
      z.coerce.number().int().positive("Max uses must be greater than 0").optional()
    ),
    oncePerCustomer: z.boolean().default(true),
    expiresAt: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional()),
    active: z.boolean().default(true),
  })
  .refine((v) => v.discountType !== "percentage" || v.discountValue <= 100, {
    message: "Percentage discount can't exceed 100",
    path: ["discountValue"],
  });

export type CouponFormValues = z.infer<typeof couponFormSchema>;
