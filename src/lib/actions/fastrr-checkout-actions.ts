"use server";

import { headers } from "next/headers";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { products } from "@/lib/db/schema";
import { fastrrFetch } from "@/lib/fastrr/client";
import { siteConfig } from "@/lib/seo";

interface CheckoutTokenResult {
  error?: string;
  token?: string;
  fastrrOrderId?: string;
}

// Never trusts client-sent prices or product data — same principle as the old
// resolveOrderItems in order-actions.ts, just re-derived here against Fastrr's numeric
// externalId instead of building our own order row directly. Fastrr looks up the actual
// price itself from the catalog-sync endpoints (/api/fastrr/products), so all we owe it
// is a valid variant_id + quantity per line.
export async function createFastrrCheckoutToken(
  items: { slug: string; quantity: number }[]
): Promise<CheckoutTokenResult> {
  if (items.length === 0) {
    return { error: "Your cart is empty." };
  }

  const slugs = items.map((i) => i.slug);
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    columns: { slug: true, externalId: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return { error: "Some items in your cart are no longer available." };
  }

  const cartItems = items.map((item) => ({
    variant_id: String(bySlug.get(item.slug)!.externalId),
    quantity: item.quantity,
  }));

  const origin = headers().get("origin") ?? siteConfig.url;

  try {
    const response = await fastrrFetch<{
      result: { token: string; data: { order_id: string } };
    }>("/api/v1/access-token/checkout", {
      cart_data: { items: cartItems },
      redirect_url: `${origin}/checkout`,
    });

    return { token: response.result.token, fastrrOrderId: response.result.data.order_id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not start checkout." };
  }
}
