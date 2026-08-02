import { MetadataRoute } from "next";
import { getAllCategories, getAllProductsForSitemap } from "@/lib/db/queries";
import { siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProductsForSitemap(),
  ]);

  // /cart and /wishlist are user-state pages with no indexable content of
  // their own (and /cart is explicitly disallowed in robots.ts) — submitting
  // them here would be self-contradictory and waste crawl budget.
  const staticRoutes = ["", "/about", "/contact"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${siteConfig.url}/${c.slug}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
