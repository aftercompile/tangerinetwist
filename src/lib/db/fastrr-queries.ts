// Catalog-sync queries consumed by Fastrr's own system (via the /api/fastrr/* routes) to
// resolve product/price/image for a cart line at checkout time. Deliberately uncached
// (unlike src/lib/db/queries.ts) — same reasoning as admin-queries.ts, this must always
// reflect the live price/stock, not a stale cached snapshot.
import { and, asc, count, eq } from "drizzle-orm";
import { db } from "./index";
import { categories, products, productImages } from "./schema";
import { toFastrrImageUrl } from "@/lib/fastrr/images";

const DEFAULT_LIMIT = 100;

function clampLimit(limit: number | undefined): number {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, 250);
}

export interface FastrrProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  handle: string;
  status: "active";
  variants: {
    id: number;
    product_id: number;
    title: string;
    price: number;
    sku: string;
    available: boolean;
  }[];
  images: { src: string }[];
}

function toFastrrProduct(row: typeof products.$inferSelect & { categorySlug: string; imageSrc: string | null }): FastrrProduct {
  return {
    id: row.externalId,
    title: row.name,
    body_html: `<p>${row.description}</p>`,
    vendor: "TangerineTwist",
    product_type: row.categorySlug,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    handle: row.slug,
    status: "active",
    variants: [
      {
        id: row.externalId,
        product_id: row.externalId,
        title: "Default Title",
        price: row.price,
        sku: row.slug,
        available: row.stock !== "low-stock",
      },
    ],
    images: row.imageSrc ? [{ src: toFastrrImageUrl(row.imageSrc) }] : [],
  };
}

async function fetchProductPage(whereClause: ReturnType<typeof eq> | undefined, page: number, limit: number) {
  const base = db
    .select({
      product: products,
      categorySlug: categories.slug,
      imageSrc: productImages.src,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.position, 0)))
    .orderBy(asc(products.externalId))
    .limit(limit)
    .offset(Math.max(page, 0) * limit);

  const rows = whereClause ? await base.where(whereClause) : await base;

  const countQuery = db.select({ value: count() }).from(products);
  const [{ value: total }] = whereClause ? await countQuery.where(whereClause) : await countQuery;

  return {
    total,
    products: rows.map((r) => toFastrrProduct({ ...r.product, categorySlug: r.categorySlug, imageSrc: r.imageSrc })),
  };
}

export async function getFastrrProducts(page: number, limit?: number) {
  return fetchProductPage(undefined, page, clampLimit(limit));
}

export async function getFastrrProductsByCollection(collectionExternalId: number, page: number, limit?: number) {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.externalId, collectionExternalId));
  if (!category) return { total: 0, products: [] };
  return fetchProductPage(eq(products.categoryId, category.id), page, clampLimit(limit));
}

export interface FastrrCollection {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  created_at: string;
  updated_at: string;
  image?: { src: string };
}

export async function getFastrrCollections(page: number, limit?: number) {
  const cappedLimit = clampLimit(limit);
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.externalId))
    .limit(cappedLimit)
    .offset(Math.max(page, 0) * cappedLimit);

  const [{ value: total }] = await db.select({ value: count() }).from(categories);

  const collections: FastrrCollection[] = rows.map((c) => ({
    id: c.externalId,
    title: c.name,
    handle: c.slug,
    body_html: `<p>${c.description}</p>`,
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
    ...(c.storyImage ? { image: { src: toFastrrImageUrl(c.storyImage) } } : {}),
  }));

  return { total, collections };
}
