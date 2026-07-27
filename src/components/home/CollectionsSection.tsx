import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

const tones: Record<string, "warm" | "charcoal" | "cool"> = {
  lamps: "warm",
  idols: "charcoal",
  "desk-organizers": "cool",
};

export function CollectionsSection() {
  return (
    <section className="container-wide py-24">
      <SectionHeading
        eyebrow="Shop by Collection"
        title="Three collections. One philosophy."
        description="Every TangerineTwist piece is designed to the same standard — considered form, honest materials, and light that feels right."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {categories.map((category, i) => (
          <AnimatedReveal key={category.slug} delay={i * 0.1}>
            <Link href={`/${category.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <ProductImagePlaceholder
                  icon={category.heroIcon === "lamp" ? "Lamp" : category.heroIcon === "sparkles" ? "Sparkles" : "LayoutGrid"}
                  tone={tones[category.slug]}
                  className="h-full w-full transition-transform duration-700 ease-premium group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/0 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                    {category.priceRange}
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-white">{category.name}</h3>
                  <p className="mt-2 text-sm text-white/80">{category.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white">
                    Shop Collection
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
