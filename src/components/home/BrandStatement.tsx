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
    <section className="container-wide pt-20 lg:pt-28">
      <AnimatedReveal className="max-w-2xl border-t border-border pt-14 lg:pt-16">
        <h2 className="h-display text-3xl leading-[1.1] md:text-4xl lg:text-[2.75rem]">
          Made differently.
        </h2>
        <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-muted lg:text-lg">
          <p>We don&apos;t mass-produce everything.</p>
          <p>Each TangerineTwist piece is designed, printed and finished in small batches.</p>
          <p className="text-charcoal">Designed in India. Made one piece at a time.</p>
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
