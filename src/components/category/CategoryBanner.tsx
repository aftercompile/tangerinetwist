import { CategoryMeta } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

const tones: Record<string, "warm" | "charcoal" | "cool"> = {
  lamps: "warm",
  idols: "charcoal",
  "desk-organizers": "cool",
};

const icons: Record<string, string> = {
  lamp: "Lamp",
  sparkles: "Sparkles",
  "layout-grid": "LayoutGrid",
};

const banners: Record<string, string> = {
  lamps: "/images/banners/banner-lamps.jpg",
  idols: "/images/banners/banner-idols.jpg",
  "desk-organizers": "/images/banners/banner-desk-organizers.jpg",
};

export function CategoryBanner({ category }: { category: CategoryMeta }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[52vh] min-h-[380px] w-full">
        <ProductImagePlaceholder
          icon={icons[category.heroIcon] ?? "Sparkles"}
          tone={tones[category.slug]}
          src={banners[category.slug]}
          alt={category.name}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
        <div className="container-wide absolute inset-x-0 bottom-0 pb-12">
          <AnimatedReveal>
            <p className="eyebrow mb-3 text-tangerine-300">{category.priceRange}</p>
            <h1 className="h-display max-w-xl text-4xl text-white md:text-5xl">{category.name}</h1>
            <p className="mt-4 max-w-lg text-sm text-white/85 md:text-base">{category.description}</p>
          </AnimatedReveal>
        </div>
      </div>
    </section>
  );
}
