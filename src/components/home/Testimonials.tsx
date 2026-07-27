import { Quote } from "lucide-react";
import { testimonials } from "@/data/content";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { RatingStars } from "@/components/shared/RatingStars";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

export function Testimonials() {
  return (
    <section className="container-wide py-24">
      <SectionHeading eyebrow="Testimonials" title="What our customers say" align="center" />
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t, i) => (
          <AnimatedReveal key={t.id} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-border p-7">
              <Quote className="h-6 w-6 text-tangerine-300" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-charcoal/90">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6">
                <RatingStars rating={t.rating} />
                <p className="mt-2 text-sm font-medium text-charcoal">{t.author}</p>
                <p className="text-xs text-muted">{t.location}</p>
              </div>
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}
