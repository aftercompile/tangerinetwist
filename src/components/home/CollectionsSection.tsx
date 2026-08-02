import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryMeta } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { staggerDelay } from "@/lib/motion";

const tones: Record<string, "warm" | "charcoal" | "cool"> = {
  lamps: "warm",
  idols: "charcoal",
  "desk-organizers": "cool",
  "home-accents": "cool",
};

const images: Record<string, string> = {
  lamps: "/images/collections/collections-lamps.jpg",
  idols: "/images/collections/collections-idols.jpg",
  "desk-organizers": "/images/collections/collections-desk-organizers.jpg",
  "home-accents": "/images/collections/collections-home-accents.jpg",
};

const heroIconToLucide: Record<string, string> = {
  lamp: "Lamp",
  sparkles: "Sparkles",
  "layout-grid": "LayoutGrid",
  watch: "Watch",
};

export function CollectionsSection({ categories }: { categories: CategoryMeta[] }) {
  return (
    <section className="container-wide py-24">
      <SectionHeading
        eyebrow="Shop by Collection"
        title="Three collections. One philosophy."
        description="Every TangerineTwist piece is designed to the same standard — considered form, honest materials, and light that feels right."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {categories.map((category, i) => (
          <AnimatedReveal key={category.slug} delay={staggerDelay(i, 0.1)}>
            <Link href={`/${category.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <ProductImagePlaceholder
                  icon={heroIconToLucide[category.heroIcon] ?? "Sparkles"}
                  tone={tones[category.slug] ?? "beige"}
                  src={images[category.slug]}
                  alt={category.name}
                  className="h-full w-full transition-transform duration-900 ease-premium group-hover:scale-[1.06]"
                />
                {/* Scrim deepens on hover so the copy stays legible as the art moves. */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent transition-opacity duration-500 ease-premium group-hover:from-charcoal/85" />

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="font-display text-2xl text-white">{category.name}</h3>
                  <p className="mt-2 text-sm text-white/80">{category.tagline}</p>

                  {/* Underline draws in on hover — a small reward for reaching the card. */}
                  <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-medium text-white">
                    Shop Collection
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-500 ease-premium group-hover:w-full" />
                  </span>
                </div>
              </div>
            </Link>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}
