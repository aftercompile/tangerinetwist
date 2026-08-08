import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import {
  categories as categoriesTable,
  products as productsTable,
  productImages as productImagesTable,
  productVariants as productVariantsTable,
  productReviews as productReviewsTable,
  productRelations as productRelationsTable,
} from "./schema";
import type { CategoryMeta, Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type ProductRow = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
  images: (typeof productImagesTable.$inferSelect)[];
  reviews: (typeof productReviewsTable.$inferSelect)[];
  // Only populated by getProductBySlug (the PDP query) — every other list query here
  // doesn't fetch variants and mapProductRow defaults this to [], matching Product.variants'
  // "empty = no variants, unchanged behavior" contract.
  variants?: (typeof productVariantsTable.$inferSelect & { images: (typeof productImagesTable.$inferSelect)[] })[];
};

function mapProductRow(row: ProductRow, relatedSlugs: string[] = []): Product {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    story: row.story,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    currency: "INR",
    material: row.material,
    materials: row.materials,
    dimensions: row.dimensions,
    weight: row.weight,
    colorway: row.colorway,
    finishTime: row.finishTime,
    images: row.images.map((img) => ({
      id: img.id,
      alt: img.alt,
      tone: img.tone,
      icon: img.icon,
      src: img.src || undefined,
    })),
    variants: (row.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size ?? undefined,
      color: v.color ?? undefined,
      sku: v.sku ?? undefined,
      price: v.price ?? undefined,
      stock: v.stock,
      images: v.images.map((img) => ({
        id: img.id,
        alt: img.alt,
        tone: img.tone,
        icon: img.icon,
        src: img.src || undefined,
      })),
    })),
    icon: row.icon,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    badges: row.badges as Product["badges"],
    styleTags: row.styleTags,
    colorTag: row.colorTag ?? undefined,
    sizeTier: row.sizeTier ?? undefined,
    features: row.features,
    careInstructions: row.careInstructions,
    shippingInfo: row.shippingInfo,
    returnPolicy: row.returnPolicy,
    faqs: row.faqs,
    reviews: row.reviews.map((rev) => ({
      id: rev.id,
      author: rev.author,
      location: rev.location,
      rating: rev.rating,
      date: rev.createdAt.toISOString(),
      title: rev.title,
      body: rev.body,
      verified: rev.verified,
    })),
    relatedSlugs,
    stock: row.stock,
    createdAt: row.createdAt.toISOString(),
    isPersonalized: row.isPersonalized,
  };
}

async function fetchRelatedSlugs(productId: string): Promise<string[]> {
  const rows = await db
    .select({ slug: productsTable.slug })
    .from(productRelationsTable)
    .innerJoin(productsTable, eq(productsTable.id, productRelationsTable.relatedProductId))
    .where(eq(productRelationsTable.productId, productId))
    .orderBy(asc(productRelationsTable.position));
  return rows.map((r) => r.slug);
}

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | undefined> => {
    const row = await db.query.products.findFirst({
      where: eq(productsTable.slug, slug),
      with: {
        category: true,
        // Shared/general photos only — variant-scoped ones are fetched below, nested
        // under their own variant, so a photo never appears in both places.
        images: { where: isNull(productImagesTable.variantId), orderBy: (img, { asc }) => [asc(img.position)] },
        variants: {
          orderBy: (v, { asc }) => [asc(v.position)],
          with: {
            images: { orderBy: (img, { asc }) => [asc(img.position)] },
          },
        },
        reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
      },
    });
    if (!row) return undefined;
    const relatedSlugs = await fetchRelatedSlugs(row.id);
    return mapProductRow(row, relatedSlugs);
  },
  ["product-by-slug"],
  { tags: ["products"] }
);

export const getProductsByCategory = unstable_cache(
  async (categorySlug: string): Promise<Product[]> => {
    const rows = await db.query.products.findMany({
      where: (p, { exists }) =>
        exists(
          db
            .select()
            .from(categoriesTable)
            .where(and(eq(categoriesTable.id, p.categoryId), eq(categoriesTable.slug, categorySlug)))
        ),
      with: {
        category: true,
        images: { orderBy: (img, { asc }) => [asc(img.position)] },
        reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
      },
    });
    return rows.map((row) => mapProductRow(row));
  },
  ["products-by-category"],
  { tags: ["products"] }
);

export const getBestSellers = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const rows = await db.query.products.findMany({
      where: sql`${productsTable.badges} @> ARRAY['bestseller']::text[]`,
      with: {
        category: true,
        images: { orderBy: (img, { asc }) => [asc(img.position)] },
        reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
      },
      limit,
    });
    return rows.map((row) => mapProductRow(row));
  },
  ["best-sellers"],
  { tags: ["products"] }
);

export const getNewArrivals = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const rows = await db.query.products.findMany({
      where: sql`${productsTable.badges} @> ARRAY['new']::text[]`,
      with: {
        category: true,
        images: { orderBy: (img, { asc }) => [asc(img.position)] },
        reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
      },
      limit,
    });
    return rows.map((row) => mapProductRow(row));
  },
  ["new-arrivals"],
  { tags: ["products"] }
);

export const getTopRated = unstable_cache(
  async (limit = 8): Promise<Product[]> => {
    const rows = await db.query.products.findMany({
      with: {
        category: true,
        images: { orderBy: (img, { asc }) => [asc(img.position)] },
        reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
      },
      orderBy: [desc(productsTable.rating)],
      limit,
    });
    return rows.map((row) => mapProductRow(row));
  },
  ["top-rated"],
  { tags: ["products"] }
);

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const relatedIds = await db
    .select({ id: productsTable.id })
    .from(productRelationsTable)
    .innerJoin(productsTable, eq(productsTable.id, productRelationsTable.relatedProductId))
    .where(eq(productRelationsTable.productId, product.id))
    .orderBy(asc(productRelationsTable.position));

  if (relatedIds.length === 0) return [];

  const rows = await db.query.products.findMany({
    where: inArray(
      productsTable.id,
      relatedIds.map((r) => r.id)
    ),
    with: {
      category: true,
      images: { orderBy: (img, { asc }) => [asc(img.position)] },
      reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
    },
  });
  return rows.map((row) => mapProductRow(row));
}

export const getAllProductSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await db.select({ slug: productsTable.slug }).from(productsTable);
    return rows.map((r) => r.slug);
  },
  ["all-product-slugs"],
  { tags: ["products"] }
);

export const getAllProductsForSitemap = unstable_cache(
  async (): Promise<{ slug: string; updatedAt: Date }[]> => {
    return db
      .select({ slug: productsTable.slug, updatedAt: productsTable.updatedAt })
      .from(productsTable);
  },
  ["all-products-sitemap"],
  { tags: ["products"] }
);

export const getAllCategories = unstable_cache(
  async (): Promise<CategoryMeta[]> => {
    const [cats, priceRanges] = await Promise.all([
      db.select().from(categoriesTable),
      db
        .select({
          categoryId: productsTable.categoryId,
          min: sql<number>`min(${productsTable.price})`,
          max: sql<number>`max(${productsTable.price})`,
        })
        .from(productsTable)
        .groupBy(productsTable.categoryId),
    ]);

    const rangeByCategoryId = new Map(priceRanges.map((r) => [r.categoryId, r]));

    return cats.map((c) => {
      const range = rangeByCategoryId.get(c.id);
      const priceRange = range ? `${formatINR(range.min)} – ${formatINR(range.max)}` : "";
      return {
        slug: c.slug,
        name: c.name,
        shortName: c.shortName,
        tagline: c.tagline,
        description: c.description,
        heroIcon: c.heroIcon,
        priceRange,
        material: c.material,
        heroStatement: c.heroStatement,
        storyTitle: c.storyTitle,
        storyBody: c.storyBody,
        storyImage: c.storyImage ?? undefined,
        journeySteps: c.journeySteps,
        stats: c.stats,
        lifestyleImage: c.lifestyleImage ?? undefined,
        lifestyleHeadline: c.lifestyleHeadline,
        lifestyleBody: c.lifestyleBody,
        closingImage: c.closingImage ?? undefined,
        closingHeadline: c.closingHeadline,
        closingBody: c.closingBody,
      };
    });
  },
  ["all-categories"],
  { tags: ["categories"] }
);

export const getCategory = unstable_cache(
  async (slug: string): Promise<CategoryMeta | undefined> => {
    const all = await getAllCategories();
    return all.find((c) => c.slug === slug);
  },
  ["category-by-slug"],
  { tags: ["categories"] }
);

export const searchProducts = unstable_cache(
  async (query: string, limit = 6): Promise<Product[]> => {
    const q = `%${query.toLowerCase()}%`;
    const rows = await db.query.products.findMany({
      where: sql`(
        lower(${productsTable.name}) like ${q}
        or lower(${productsTable.tagline}) like ${q}
        or lower(${productsTable.material}) like ${q}
      )`,
      with: {
        category: true,
        images: { orderBy: (img, { asc }) => [asc(img.position)] },
        reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
      },
      limit,
    });
    return rows.map((row) => mapProductRow(row));
  },
  ["search-products"],
  { tags: ["products"] }
);

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await db.query.products.findMany({
    where: inArray(productsTable.slug, slugs),
    with: {
      category: true,
      images: { orderBy: (img, { asc }) => [asc(img.position)] },
      reviews: { orderBy: (rev, { desc }) => [desc(rev.createdAt)] },
    },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, mapProductRow(row)]));
  // Preserve the caller's slug order (localStorage insertion order for wishlist/recently-viewed).
  return slugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));
}
