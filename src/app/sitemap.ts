import { MetadataRoute } from "next";
import { getAllCategories, getAllProductsForSitemap } from "@/lib/db/queries";
import { siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProductsForSitemap(),
  ]);

  const staticRoutes = ["", "/about", "/contact", "/cart", "/wishlist"].map((path) => ({
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
