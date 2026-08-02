import { ArrowUp } from "lucide-react";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { MouseParallax } from "@/components/shared/MouseParallax";
import { CategoryParallaxImage } from "./CategoryParallaxImage";
import { Button } from "@/components/ui/button";
import type { CategoryMeta } from "@/lib/types";

// Full-width emotional closer before <Footer/>. Renders nothing if the
// category has no closing copy set.
export function CategoryClosingCTA({ category, gridAnchorId }: { category: CategoryMeta; gridAnchorId: string }) {
  if (!category.closingHeadline && !category.closingBody) return null;

  return (
    <section className="relative isolate overflow-hidden bg-charcoal py-32">
      {category.closingImage && (
        <MouseParallax strength={12} className="absolute inset-0">
          <CategoryParallaxImage icon="Sparkles" tone="charcoal" src={category.closingImage} alt={category.name} />
        </MouseParallax>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/40" />

      <div className="container-wide relative flex flex-col items-center px-6 text-center">
        <AnimatedReveal blur>
          <h2 className="h-display max-w-2xl text-4xl leading-tight text-white sm:text-5xl">
            {category.closingHeadline}
          </h2>
        </AnimatedReveal>
        <AnimatedReveal delay={0.15} className="mt-5 max-w-lg text-base leading-relaxed text-white/75 md:text-lg">
          {category.closingBody}
        </AnimatedReveal>
        <AnimatedReveal delay={0.3} className="mt-9">
          <Button variant="accent" size="lg" asChild>
            <a href={`#${gridAnchorId}`}>
              Explore the Collection
              <ArrowUp className="h-4 w-4" />
            </a>
          </Button>
        </AnimatedReveal>
      </div>
    </section>
  );
}
