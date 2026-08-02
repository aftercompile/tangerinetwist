import { ArrowDown } from "lucide-react";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { MouseParallax } from "@/components/shared/MouseParallax";
import { CategoryParallaxImage } from "./CategoryParallaxImage";
import { Button } from "@/components/ui/button";

// Full-width editorial break injected mid-grid. Renders nothing if the
// category has no lifestyle copy set — CategoryExplorer only renders this
// between two product batches when there are enough products to split.
export function CategoryLifestyleBreak({
  image,
  headline,
  body,
  gridAnchorId,
}: {
  image?: string;
  headline: string;
  body: string;
  gridAnchorId: string;
}) {
  if (!headline && !body) return null;

  return (
    <section className="relative isolate my-6 overflow-hidden rounded-[2.5rem] bg-charcoal py-28 sm:mx-6 lg:mx-10">
      {image && (
        <MouseParallax strength={10} className="absolute inset-0">
          <CategoryParallaxImage icon="Sparkles" tone="charcoal" src={image} alt={headline} travel={40} />
        </MouseParallax>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-charcoal/70" />

      <div className="container-wide relative flex flex-col items-center px-6 text-center">
        <AnimatedReveal blur>
          <h2 className="h-display max-w-2xl text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            {headline}
          </h2>
        </AnimatedReveal>
        <AnimatedReveal delay={0.15} className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
          {body}
        </AnimatedReveal>
        <AnimatedReveal delay={0.3} className="mt-9">
          <Button variant="light" size="lg" asChild>
            <a href={`#${gridAnchorId}`}>
              Continue Exploring
              <ArrowDown className="h-4 w-4" />
            </a>
          </Button>
        </AnimatedReveal>
      </div>
    </section>
  );
}
