import { z } from "zod";

export const shippingDetailsSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  pin: z.string().trim().min(4, "Enter a valid PIN code"),
  paymentMethod: z.enum(["card", "upi", "cod"]),
});

export type ShippingDetails = z.infer<typeof shippingDetailsSchema>;

export const placeOrderInputSchema = z.object({
  shipping: shippingDetailsSchema,
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Your cart is empty"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
