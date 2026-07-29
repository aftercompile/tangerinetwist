import { materials } from "@/data/content";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { getIcon } from "@/components/shared/icon-map";
import { staggerDelay } from "@/lib/motion";

export function Materials() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-24 text-cream">
      {/* Single static warm wash keeps the dark section from reading as flat black. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "radial-gradient(circle, #E86A2C 0%, transparent 70%)" }}
      />

      <div className="container-wide relative">
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
              <AnimatedReveal key={m.name} delay={staggerDelay(i)}>
                <div className="group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-soft ring-1 ring-white/5 transition-all duration-500 ease-premium group-hover:bg-tangerine-500 group-hover:ring-tangerine-400/40">
                    <Icon
                      className="h-5 w-5 text-tangerine-400 transition-colors duration-500 ease-premium group-hover:text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="mt-5 text-base font-medium">{m.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/60">{m.body}</p>
                </div>
              </AnimatedReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
