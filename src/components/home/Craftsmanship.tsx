import { craftsmanshipSteps } from "@/data/content";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

export function Craftsmanship() {
  return (
    <section id="craftsmanship" className="container-wide py-24">
      <SectionHeading
        eyebrow="Craftsmanship"
        title="From file to finished object"
        description="Precision technology is only half the story. Every piece passes through human hands before it reaches yours."
      />
      <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {craftsmanshipSteps.map((step, i) => (
          <AnimatedReveal key={step.step} delay={i * 0.08}>
            <span className="font-display text-4xl text-beige-dark">{step.step}</span>
            <h3 className="mt-4 text-lg font-medium text-charcoal">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}
