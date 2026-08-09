import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

/**
 * A short statement, not a marketing section — no icons, no feature pillars,
 * no stats. It replaces the old WhyTangerineTwist tiles and seeded
 * testimonials, both of which read as template filler rather than something a
 * small studio would actually say.
 */
export function BrandStatement() {
  return (
    <section className="container-wide pt-16 lg:pt-20">
      <AnimatedReveal className="max-w-2xl border-t border-border pt-12 lg:pt-14">
        <h2 className="h-display text-3xl leading-[1.1] md:text-4xl lg:text-[2.75rem]">
          From a screen to your space.
        </h2>
        {/* A stanza, not paragraphs — three short lines that read as one thought. */}
        <div className="mt-6 flex flex-col gap-1 text-lg leading-relaxed text-muted lg:text-xl">
          <p>Designed digitally.</p>
          <p>3D printed in small batches.</p>
          <p>Made to be lived with.</p>
        </div>
        <Link
          href="/about"
          className="link-underline mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal"
        >
          Our story
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </AnimatedReveal>
    </section>
  );
}
