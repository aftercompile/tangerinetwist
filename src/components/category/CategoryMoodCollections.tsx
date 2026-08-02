import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { moods } from "@/lib/moods";
import { computeFilterChips } from "@/lib/category-filters";
import { staggerDelay } from "@/lib/motion";
import type { Product } from "@/lib/types";

// Only shows moods that actually have a matching product in this category —
// never a mood card that leads to an empty grid.
export function CategoryMoodCollections({
  categorySlug,
  products,
  gridAnchorId,
}: {
  categorySlug: string;
  products: Product[];
  gridAnchorId: string;
}) {
  const availableChipIds = new Set(computeFilterChips(products).map((c) => c.id));
  const relevant = moods.filter((m) => availableChipIds.has(m.chipId));
  if (relevant.length === 0) return null;

  return (
    <section className="bg-beige py-24">
      <div className="container-wide">
        <AnimatedReveal>
          <p className="eyebrow mb-3 text-tangerine-600">Shop by Mood</p>
          <h2 className="h-display max-w-md text-3xl md:text-4xl">Find the feeling you&apos;re after</h2>
        </AnimatedReveal>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {relevant.map((mood, i) => (
            <AnimatedReveal key={mood.slug} delay={staggerDelay(i, 0.08)} className="w-64 shrink-0 sm:w-72">
              {/* Plain <a> (not next/link) — a full navigation so CategoryExplorer
                  always mounts fresh and its window.location read on mount reliably
                  sees the ?mood= param, even when clicked from this same category page. */}
              <a href={`/${categorySlug}?mood=${encodeURIComponent(mood.chipId)}#${gridAnchorId}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                  <ProductImagePlaceholder
                    icon="Sparkles"
                    tone="warm"
                    src={mood.image}
                    alt={mood.label}
                    className="h-full w-full transition-transform duration-700 ease-premium group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-xl text-white">{mood.label}</h3>
                    <p className="mt-1 text-xs text-white/75">{mood.description}</p>
                  </div>
                </div>
              </a>
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
