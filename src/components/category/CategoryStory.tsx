import { Parallax } from "@/components/shared/Parallax";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { ProductionJourney } from "./ProductionJourney";
import type { CategoryMeta } from "@/lib/types";

const HERO_ICON_MAP: Record<string, string> = {
  lamp: "Lamp",
  sparkles: "Sparkles",
  "layout-grid": "LayoutGrid",
};

// Renders nothing when the category has neither storytelling copy nor journey
// steps set — a freshly admin-created category just skips this section.
export function CategoryStory({ category }: { category: CategoryMeta }) {
  const hasStory = Boolean(category.storyTitle || category.storyBody);
  const hasJourney = category.journeySteps.length > 0;
  if (!hasStory && !hasJourney) return null;

  return (
    <section className="bg-warm-white py-24">
      <div className="container-wide">
        {hasStory && (
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {category.storyImage && (
              <AnimatedReveal direction="right" className="order-2 lg:order-1">
                <Parallax speed={-6} className="overflow-hidden rounded-3xl">
                  <ProductImagePlaceholder
                    icon={HERO_ICON_MAP[category.heroIcon] ?? "Sparkles"}
                    tone="beige"
                    src={category.storyImage}
                    alt={category.storyTitle}
                    className="aspect-[4/5] w-full"
                  />
                </Parallax>
              </AnimatedReveal>
            )}
            <AnimatedReveal className={category.storyImage ? "order-1 lg:order-2" : ""}>
              <p className="eyebrow mb-4 text-tangerine-600">Craft &amp; Materials</p>
              <h2 className="h-display max-w-md text-3xl md:text-4xl">{category.storyTitle}</h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">{category.storyBody}</p>
            </AnimatedReveal>
          </div>
        )}

        {hasJourney && (
          <div className={hasStory ? "mt-20" : ""}>
            <AnimatedReveal>
              <p className="eyebrow mb-4 text-center text-tangerine-600">The Process</p>
              <h3 className="h-display text-center text-2xl md:text-3xl">From Concept to Doorstep</h3>
            </AnimatedReveal>
            <ProductionJourney steps={category.journeySteps} />
          </div>
        )}
      </div>
    </section>
  );
}
