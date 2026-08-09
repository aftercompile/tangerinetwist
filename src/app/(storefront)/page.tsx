import { Metadata } from "next";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { Hero } from "@/components/home/Hero";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStatement } from "@/components/home/BrandStatement";
import { getAllCategories, getBestSellers, getNewArrivals, getTopRated } from "@/lib/db/queries";
import { buildMetadata, siteConfig } from "@/lib/seo";
import type { Product } from "@/lib/types";

// Without this, "/" just inherited the root layout's generic default title
// and had no explicit canonical tag — the homepage is the single
// highest-value page for search, so it gets its own tuned metadata like
// every other route instead of relying on a fallback.
export const metadata: Metadata = buildMetadata({
  title: "Designer Lamps, Decorative Idols & Desk Organizers",
  description: siteConfig.description,
  path: "/",
});

// Exactly four featured pieces, chosen by the store's existing merchandising
// signals in priority order — bestseller badge, then the "new" badge, then
// rating — rather than a hand-picked list that would go stale.
function pickFeatured(...pools: Product[][]): Product[] {
  const seen = new Set<string>();
  const picked: Product[] = [];
  for (const pool of pools) {
    for (const product of pool) {
      if (picked.length === 4) return picked;
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      picked.push(product);
    }
  }
  return picked;
}

export default async function HomePage() {
  const [categories, bestSellers, newArrivals, topRated] = await Promise.all([
    getAllCategories(),
    getBestSellers(4),
    getNewArrivals(4),
    getTopRated(4),
  ]);
  const featured = pickFeatured(bestSellers, newArrivals, topRated);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    // No SearchAction here — the site's search is an in-page overlay
    // (SearchOverlay.tsx), not a dedicated results URL, so a SearchAction
    // target would point at a results page that doesn't actually exist.
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SmoothScroll />
      <Hero />
      <CollectionsSection categories={categories} />
      <FeaturedProducts products={featured} />
      <BrandStatement />
    </>
  );
}
