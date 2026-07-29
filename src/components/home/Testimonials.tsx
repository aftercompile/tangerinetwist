import { Quote } from "lucide-react";
import { testimonials } from "@/data/content";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { RatingStars } from "@/components/shared/RatingStars";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { staggerDelay } from "@/lib/motion";

export function Testimonials() {
  return (
    <section className="container-wide py-24">
      <SectionHeading eyebrow="Testimonials" title="What our customers say" align="center" />
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t, i) => (
          <AnimatedReveal key={t.id} delay={staggerDelay(i)}>
            <figure className="group flex h-full flex-col rounded-2xl border border-border bg-warm-white/40 p-7 transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:border-tangerine-200 hover:bg-warm-white hover:shadow-card">
              <Quote className="h-6 w-6 text-tangerine-300 transition-colors duration-500 ease-premium group-hover:text-tangerine-500" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-charcoal/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6">
                <RatingStars rating={t.rating} />
                <p className="mt-2 text-sm font-medium text-charcoal">{t.author}</p>
                <p className="text-xs text-muted">{t.location}</p>
              </figcaption>
            </figure>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}
