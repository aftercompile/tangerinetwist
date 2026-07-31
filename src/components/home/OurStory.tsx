import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { Parallax } from "@/components/shared/Parallax";
import { Button } from "@/components/ui/button";

export function OurStory() {
  return (
    <section className="overflow-hidden bg-beige py-24">
      <div className="container-wide grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* The two plates drift at opposite speeds, so the pair gains depth as
            it scrolls instead of moving as one flat block. */}
        <AnimatedReveal className="order-2 grid grid-cols-2 gap-4 lg:order-1" direction="right">
          <Parallax speed={-6}>
            <ProductImagePlaceholder
              icon="Sparkles"
              tone="warm"
              src="/images/story/story-1.jpg"
              alt="A hand sanding a freshly 3D-printed ribbed vase in the studio"
              className="mt-8 aspect-[3/4] w-full rounded-3xl shadow-lift"
            />
          </Parallax>
          <Parallax speed={6}>
            <ProductImagePlaceholder
              icon="Lamp"
              tone="cool"
              src="/images/story/story-2.jpg"
              alt="A 3D printer building a fluted vase layer by layer"
              className="aspect-[3/4] w-full rounded-3xl shadow-lift"
            />
          </Parallax>
        </AnimatedReveal>

        <AnimatedReveal className="order-1 lg:order-2" delay={0.1} direction="left">
          <p className="eyebrow mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-tangerine-500" />
            Our Story
          </p>
          <h2 className="h-display text-3xl leading-[1.1] md:text-4xl">
            Started in a small studio, obsessed with one question.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted">
            What if precision manufacturing could feel as warm as something handmade? TangerineTwist
            began with that question — combining industrial 3D printing technology with the patience
            of a craft studio, piece by piece, layer by layer.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Today, every lamp, idol and desk accessory that leaves our studio has been designed,
            printed, sanded and inspected by hand — built to outlast trends, not just seasons.
          </p>
          <Button variant="outline" size="lg" className="group mt-8" asChild>
            <Link href="/about">
              Read Our Full Story
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
            </Link>
          </Button>
        </AnimatedReveal>
      </div>
    </section>
  );
}
