import { whyTangerineTwist } from "@/data/content";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { getIcon } from "@/components/shared/icon-map";

export function WhyTangerineTwist() {
  return (
    <section className="bg-beige py-24">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Why TangerineTwist"
          title="Designed to justify a second look"
          align="center"
        />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyTangerineTwist.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <AnimatedReveal key={item.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl bg-warm-white p-7 shadow-card">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-tangerine-50">
                    <Icon className="h-5 w-5 text-tangerine-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 text-base font-medium text-charcoal">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </AnimatedReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
