"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Product } from "@/lib/types";
import { RatingStars } from "@/components/shared/RatingStars";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { Button } from "@/components/ui/button";
import { DURATION, EASE_PREMIUM, VIEWPORT, staggerDelay } from "@/lib/motion";

// Reviews are fetched all at once (see getProductBySlug), but rendering all of
// them — each wrapped in its own scroll-triggered AnimatedReveal — turns a
// popular product's page into a very long scroll and a lot of simultaneous
// viewport observers. Revealing them a page at a time keeps the initial render
// light without needing a paginated query.
const PAGE_SIZE = 5;

export function Reviews({ product }: { product: Product }) {
  const reduced = useReducedMotion();
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const visibleReviews = product.reviews.slice(0, visibleCount);
  const remaining = product.reviews.length - visibleReviews.length;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = product.reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = product.reviews.length ? (count / product.reviews.length) * 100 : 0;
    return { star, pct };
  });

  return (
    <section className="mt-24">
      <h2 className="h-display text-2xl md:text-3xl">Customer Reviews</h2>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
        <AnimatedReveal direction="right" className="flex flex-col gap-4">
          <div>
            <p className="h-display text-5xl">{product.rating.toFixed(1)}</p>
            <RatingStars rating={product.rating} size="md" className="mt-2" />
            <p className="mt-1 text-xs text-muted">Based on {product.reviewCount} reviews</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {distribution.map((d, i) => (
              <div key={d.star} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-8">{d.star} star</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-beige">
                  <motion.div
                    className="h-full rounded-full bg-tangerine-500"
                    initial={{ width: reduced ? `${d.pct}%` : 0 }}
                    whileInView={{ width: `${d.pct}%` }}
                    viewport={VIEWPORT}
                    transition={{ duration: DURATION.slow, delay: staggerDelay(i, 0.08), ease: EASE_PREMIUM }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnimatedReveal>

        <div>
          <ul className="flex flex-col divide-y divide-border">
            {visibleReviews.map((review, i) => (
              <AnimatedReveal key={review.id} as="li" delay={staggerDelay(i, 0.06, 0.3)} className="py-6 first:pt-0">
                <div className="flex items-center justify-between">
                  <RatingStars rating={review.rating} />
                  <span className="text-xs text-muted">{review.date}</span>
                </div>
                <h4 className="mt-3 text-sm font-medium text-charcoal">{review.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{review.body}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                  {review.verified && <BadgeCheck className="h-3.5 w-3.5 text-tangerine-600" />}
                  <span className="font-medium text-charcoal">{review.author}</span>
                  <span>· {review.location}</span>
                </div>
              </AnimatedReveal>
            ))}
          </ul>

          {remaining > 0 && (
            <div className="mt-8 flex justify-center border-t border-border pt-8">
              <Button
                variant="outline"
                size="md"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Load {Math.min(remaining, PAGE_SIZE)} More Reviews
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
