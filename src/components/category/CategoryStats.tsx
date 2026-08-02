"use client";

import { CountUp } from "@/components/shared/CountUp";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { getIcon } from "@/components/shared/icon-map";
import { staggerDelay } from "@/lib/motion";
import type { CategoryStat } from "@/lib/types";

// Renders null (not an empty strip) when there's nothing to show — keeps a
// freshly admin-created category without stats/products from showing a broken
// empty bar rather than just skipping the section entirely.
export function CategoryStats({
  productCount,
  countLabel,
  countIcon = "Sparkles",
  stats,
}: {
  productCount: number;
  countLabel: string;
  countIcon?: string;
  stats: CategoryStat[];
}) {
  if (productCount === 0 && stats.length === 0) return null;
  const CountIcon = getIcon(countIcon);

  return (
    <section className="border-y border-border bg-warm-white py-9">
      <div className="container-wide flex flex-wrap items-center justify-center gap-x-10 gap-y-5 lg:justify-between">
        {productCount > 0 && (
          <AnimatedReveal className="flex items-center gap-2.5 text-charcoal">
            <CountIcon className="h-4 w-4 shrink-0 text-tangerine-500" strokeWidth={1.5} />
            <span className="h-display text-base">
              <CountUp value={productCount} /> {countLabel}
            </span>
          </AnimatedReveal>
        )}
        {stats.map((stat, i) => {
          const Icon = getIcon(stat.icon);
          return (
            <AnimatedReveal
              key={stat.label}
              delay={staggerDelay(i + 1, 0.06)}
              className="flex items-center gap-2.5 text-charcoal"
            >
              <Icon className="h-4 w-4 shrink-0 text-tangerine-500" strokeWidth={1.5} />
              <span className="h-display text-base">{stat.label}</span>
            </AnimatedReveal>
          );
        })}
      </div>
    </section>
  );
}
