"use client";

import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { staggerDelay } from "@/lib/motion";

// Concept -> Digital Sculpt -> 8K Resin Printing -> Hand Finished -> Quality
// Checked -> Delivered, from category.journeySteps. The connecting line is one
// absolute strip behind the circles rather than per-item math — each circle's
// own opaque background covers the line where it passes underneath, which is a
// simpler and more robust way to get a "connected dots" look than positioning a
// line segment between every pair of items.
export function ProductionJourney({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null;

  return (
    <ol className="relative mt-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-4">
      <div aria-hidden className="absolute left-0 right-0 top-5 hidden h-px bg-border md:block" />
      {steps.map((step, i) => (
        <AnimatedReveal
          key={step}
          as="li"
          delay={staggerDelay(i, 0.1)}
          className="relative z-10 flex items-center gap-4 md:flex-1 md:flex-col md:items-center md:gap-3 md:text-center"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-tangerine-300 bg-warm-white font-display text-sm text-tangerine-700">
            {i + 1}
          </span>
          <span className="text-sm font-medium text-charcoal md:max-w-[8rem]">{step}</span>
        </AnimatedReveal>
      ))}
    </ol>
  );
}
