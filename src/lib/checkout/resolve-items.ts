import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { products } from "@/lib/db/schema";
import { isLineSoldOut, soldOutCartMessage } from "@/lib/stock";
import type { PlaceOrderInput } from "@/lib/validation/order";

// Extra per-line facts some payment providers want (Razorpay Magic Checkout's `line_items`)
// that aren't stored on an order line itself. Index-aligned with `orderItemRows`.
export interface LineMeta {
  sku: string;
  // Same id Fastrr's catalog sync uses: the variant's externalId, else the product's.
  catalogVariantId: number;
  description: string;
}

// Shared by every checkout path (COD, standard Razorpay, Magic Checkout) — never trust
// client-sent prices; cart lines are a denormalized localStorage snapshot that can go
// stale or be tampered with.
export async function resolveOrderItems(items: PlaceOrderInput["items"]) {
  const slugs = items.map((i) => i.slug);
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)] },
      variants: { with: { images: { orderBy: (img, { asc }) => [asc(img.position)] } } },
    },
  });

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return { error: "Some items in your cart are no longer available." } as const;
  }

  // Stock is checked here, against the DB, on every path that places an order — a cart in
  // someone's localStorage can be days old, and the client could send anything, so nothing
  // the browser believes about availability is trusted.
  const soldOutMessage = soldOutCartMessage(
    items.flatMap((item) => {
      const product = bySlug.get(item.slug)!;
      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
      return isLineSoldOut(product, variant) ? [product.name] : [];
    })
  );
  if (soldOutMessage) return { error: soldOutMessage } as const;

  const lineMeta: LineMeta[] = [];
  const orderItemRows = items.map((item) => {
    const product = bySlug.get(item.slug)!;
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
    const primaryImage = variant?.images[0] ?? product.images[0];
    lineMeta.push({
      sku: variant?.sku || product.slug,
      catalogVariantId: variant?.externalId ?? product.externalId,
      description: product.tagline || product.description,
    });
    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      variantLabel: variant ? [variant.size, variant.color].filter(Boolean).join(" / ") : null,
      name: product.name,
      slug: product.slug,
      price: variant?.price ?? product.price,
      material: product.material,
      imageSrc: primaryImage?.src ?? null,
      imageIcon: primaryImage?.icon ?? product.icon,
      imageTone: primaryImage?.tone ?? "beige",
      quantity: item.quantity,
    };
  });

  const subtotal = orderItemRows.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { orderItemRows, subtotal, lineMeta } as const;
}

export type ResolvedOrderItemRow = Extract<Awaited<ReturnType<typeof resolveOrderItems>>, { orderItemRows: unknown }>["orderItemRows"][number];
