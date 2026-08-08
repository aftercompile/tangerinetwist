import { z } from "zod";

export const shippingDetailsSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  // Required for Shiprocket's order-create API (billing_state) — orders placed before
  // this field existed have it as null, which is fine since it's only enforced here,
  // not at the DB column level.
  state: z.string().trim().min(1, "State is required"),
  pin: z.string().trim().min(4, "Enter a valid PIN code"),
  // This is the checkout-time choice, not the granular method eventually stored on the
  // order row — Razorpay's own checkout modal picks between card/UPI/netbanking/wallet,
  // so "online" just routes to createOrderForPayment; "cod" routes to placeOrder.
  paymentMethod: z.enum(["online", "cod"]),
});

export type ShippingDetails = z.infer<typeof shippingDetailsSchema>;

export const placeOrderInputSchema = z.object({
  shipping: shippingDetailsSchema,
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().positive(),
        // Absent for products with no variants — resolveOrderItems (order-actions.ts)
        // falls back to the product's own price when this isn't set.
        variantId: z.string().optional(),
      })
    )
    .min(1, "Your cart is empty"),
  // Order-level, not per-item — re-validated authoritatively server-side in
  // order-actions.ts regardless of what the client's checkout preview showed.
  couponCode: z.string().trim().optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
