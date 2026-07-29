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

export default async function HomePage() {
  const [categories, bestSellers, newArrivals, favorites] = await Promise.all([
    getAllCategories(),
    getBestSellers(8),
    getNewArrivals(8),
    getTopRated(8),
  ]);

  return (
    <>
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
