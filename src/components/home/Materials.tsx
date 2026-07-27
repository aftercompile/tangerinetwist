import { materials } from "@/data/content";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { getIcon } from "@/components/shared/icon-map";

export function Materials() {
  return (
    <section className="bg-charcoal py-24 text-cream">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Materials"
          title="Built from materials we trust"
          description="Every material is chosen for the same three things: how it feels, how it lasts, and how gently it treats the planet."
          className="[&_h2]:text-cream [&_p]:text-cream/60"
        />
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {materials.map((m, i) => {
            const Icon = getIcon(m.icon);
            return (
              <AnimatedReveal key={m.name} delay={i * 0.08}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-soft">
                  <Icon className="h-5 w-5 text-tangerine-400" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 text-base font-medium">{m.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{m.body}</p>
              </AnimatedReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
