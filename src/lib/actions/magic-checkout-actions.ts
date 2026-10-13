"use server";

import { getCurrentCustomer } from "@/lib/auth/customer-guard";
import { resolveOrderItems } from "@/lib/checkout/resolve-items";
import { toAbsoluteImageUrl } from "@/lib/fastrr/images";
import { designImageUrl } from "@/lib/letter-builder/image-url";
import { getRazorpayClient, verifyPaymentSignature } from "@/lib/razorpay/client";
import { createMagicSession, finalizeMagicOrder } from "@/lib/razorpay/magic-checkout";
import { buildMagicOrderPayload, isMagicCheckoutEnabled, newSessionToken } from "@/lib/razorpay/magic-order";
import { siteConfig } from "@/lib/seo";
import { placeOrderInputSchema, type PlaceOrderInput } from "@/lib/validation/order";

// Same item shape every other checkout action accepts — slug/quantity/variantId only. No
// prices, ever: resolveOrderItems re-reads them from the database.
const itemsSchema = placeOrderInputSchema.shape.items;

export async function createMagicCheckout(items: PlaceOrderInput["items"]): Promise<{
  error?: string;
  razorpayOrderId?: string;
  keyId?: string;
  prefill?: { name?: string; email?: string };
}> {
  if (!isMagicCheckoutEnabled()) return { error: "This checkout isn't available right now." };

  const parsed = itemsSchema.safeParse(items);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid cart" };

  // Price re-read + stock check, shared with every other checkout path.
  const resolved = await resolveOrderItems(parsed.data);
  if ("error" in resolved) return { error: resolved.error };
  const { orderItemRows, subtotal, lineMeta } = resolved;

  const token = newSessionToken();
  const payload = buildMagicOrderPayload({
    token,
    siteUrl: siteConfig.url,
    lines: orderItemRows.map((row, i) => ({
      // A designed piece reads "Name Keychain — ANYA — Bead keychain" in Razorpay's summary.
      name: row.customization ? `${row.name} — ${row.variantLabel}` : row.name,
      slug: row.slug,
      price: row.price,
      quantity: row.quantity,
      sku: lineMeta[i].sku,
      catalogVariantId: lineMeta[i].catalogVariantId,
      description: lineMeta[i].description,
      designKey: lineMeta[i].designKey,
      // A design has no photo; its thumbnail is rendered by /api/design-image.
      imageUrl: row.customization
        ? designImageUrl(row.slug, row.customization)
        : row.imageSrc
          ? toAbsoluteImageUrl(row.imageSrc)
          : null,
    })),
  });

  // Razorpay first, so nothing is stored in our database if the order can't be created.
  let razorpayOrderId: string;
  try {
    // The SDK's types predate Magic Checkout's `line_items` fields.
    const order = await getRazorpayClient().orders.create(payload as never);
    razorpayOrderId = order.id;
  } catch (err) {
    const description = (err as { error?: { description?: string } })?.error?.description;
    return { error: description ?? (err instanceof Error ? err.message : "Could not start checkout.") };
  }

  const customer = await getCurrentCustomer();
  await createMagicSession({
    token,
    razorpayOrderId,
    customerId: customer?.id ?? null,
    items: orderItemRows,
    subtotal,
  });

  return {
    razorpayOrderId,
    keyId: process.env.RAZORPAY_KEY_ID,
    prefill: customer ? { name: customer.fullName, email: customer.email } : undefined,
  };
}

// The browser's success callback. The signature proves Razorpay (not the page) says this
// payment belongs to this order; finalizeMagicOrder then re-fetches the order from Razorpay
// before recording anything. The webhook does the same independently, so a customer who
// closes the tab right after paying still gets their order.
export async function confirmMagicCheckout(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ error?: string; orderNumber?: string; pending?: boolean }> {
  if (!verifyPaymentSignature(input)) return { error: "Payment verification failed." };

  // The order can take a moment to flip to paid/placed on Razorpay's side.
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await finalizeMagicOrder(input.razorpayOrderId);
    if (result.status === "done") return { orderNumber: result.orderNumber };
    if (result.status === "error") return { error: result.error };
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  // Verified but not yet visible as complete — the webhook will record it.
  return { pending: true };
}
