"use server";

import { headers } from "next/headers";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { products } from "@/lib/db/schema";
import { fastrrFetch } from "@/lib/fastrr/client";
import { toFastrrImageUrl } from "@/lib/fastrr/images";
import { siteConfig } from "@/lib/seo";

interface CheckoutTokenResult {
  error?: string;
  token?: string;
  fastrrOrderId?: string;
}


// Never trusts client-sent prices or product data — the client only sends slugs,
// quantities, and which variant (if any), and every price/name/image below is re-read from
// our own DB, the same principle the old resolveOrderItems in order-actions.ts used.
//
// `catalog_data` is sent inline per item rather than relying on Fastrr's catalog-sync
// polling of /api/fastrr/*. Confirmed necessary, not just belt-and-braces: a token
// created without it stores only {variant_id, quantity} on Fastrr's side (verified via
// their Order/Details API), so their overlay has no name/price/image to render and
// immediately bails to the fallback URL. Sending it makes checkout independent of
// whether their team has finished registering our catalog endpoints — those endpoints
// still exist and stay useful for their own product browsing/abandoned-cart features.
export async function createFastrrCheckoutToken(
  items: { slug: string; quantity: number; variantId?: string }[]
): Promise<CheckoutTokenResult> {
  if (items.length === 0) {
    return { error: "Your cart is empty." };
  }

  const slugs = items.map((i) => i.slug);
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    columns: { slug: true, externalId: true, name: true, price: true },
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
      variants: { with: { images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 } } },
    },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return { error: "Some items in your cart are no longer available." };
  }

  const cartItems = items.map((item) => {
    const product = bySlug.get(item.slug)!;
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
    const rawImage = variant?.images[0]?.src ?? product.images[0]?.src;
    return {
      // Falls back to the product's own externalId for variant-less products, unchanged
      // from before this feature existed.
      variant_id: String(variant?.externalId ?? product.externalId),
      quantity: item.quantity,
      catalog_data: {
        price: variant?.price ?? product.price,
        name: product.name,
        // Squared + absolute — see toFastrrImageUrl for why both matter.
        image_url: rawImage ? toFastrrImageUrl(rawImage) : "",
      },
    };
  });

  const origin = headers().get("origin") ?? siteConfig.url;

  try {
    const response = await fastrrFetch<{
      result: { token: string; data: { order_id: string } };
    }>("/api/v1/access-token/checkout", {
      cart_data: { items: cartItems },
      redirect_url: `${origin}/checkout/fastrr`,
    });

    return { token: response.result.token, fastrrOrderId: response.result.data.order_id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not start checkout." };
  }
}
