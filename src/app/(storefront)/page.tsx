import { Metadata } from "next";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { Hero } from "@/components/home/Hero";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { OurStory } from "@/components/home/OurStory";
import { Craftsmanship } from "@/components/home/Craftsmanship";
import { Materials } from "@/components/home/Materials";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyTangerineTwist } from "@/components/home/WhyTangerineTwist";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { getAllCategories, getBestSellers, getNewArrivals, getTopRated } from "@/lib/db/queries";
import { buildMetadata, siteConfig } from "@/lib/seo";

// Without this, "/" just inherited the root layout's generic default title
// and had no explicit canonical tag — the homepage is the single
// highest-value page for search, so it gets its own tuned metadata like
// every other route instead of relying on a fallback.
export const metadata: Metadata = buildMetadata({
  title: "Designer Lamps, Decorative Idols & Desk Organizers",
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage() {
  const [categories, bestSellers, newArrivals, favorites] = await Promise.all([
    getAllCategories(),
    getBestSellers(8),
    getNewArrivals(8),
    getTopRated(8),
  ]);

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
      <OurStory />
      <Craftsmanship />
      <Materials />
      <FeaturedProducts bestSellers={bestSellers} newArrivals={newArrivals} favorites={favorites} />
      <WhyTangerineTwist />
      <Testimonials />
      <Newsletter />
      <InstagramGallery />
    </>
  );
}
