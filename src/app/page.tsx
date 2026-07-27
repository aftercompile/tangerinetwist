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

export default function HomePage() {
  return (
    <>
      <Hero />
      <CollectionsSection />
      <OurStory />
      <Craftsmanship />
      <Materials />
      <FeaturedProducts />
      <WhyTangerineTwist />
      <Testimonials />
      <Newsletter />
      <InstagramGallery />
    </>
  );
}
