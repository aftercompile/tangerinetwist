import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lightbulb, Sparkle, Hammer, Leaf, Gem, Eye } from "lucide-react";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { Craftsmanship } from "@/components/home/Craftsmanship";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Our Story",
  description:
    "TangerineTwist is a modern design studio crafting premium 3D-printed home décor and workspace essentials. Learn about our mission, vision and craftsmanship.",
  path: "/about",
});

const values = [
  { title: "Innovation", body: "We treat 3D printing as a design tool, not a shortcut — pushing what precision manufacturing can look and feel like.", icon: Lightbulb },
  { title: "Modern Design", body: "Every product is designed for how homes and desks actually look today, not a decade ago.", icon: Sparkle },
  { title: "Craftsmanship", body: "Printing is where our process starts, not ends. Every piece is finished, sanded and inspected by hand.", icon: Hammer },
  { title: "Sustainability", body: "Plant-derived PLA, made-to-order production, and recyclable packaging — considered choices at every step.", icon: Leaf },
  { title: "Quality", body: "We'd rather ship fewer products exceptionally well than chase a catalogue that's a mile wide and an inch deep.", icon: Gem },
  { title: "Attention to Detail", body: "From the ribbing on a lamp to the flame ring on a Nataraja idol — the details are the whole point.", icon: Eye },
];

export default function AboutPage() {
  return (
    <div>
      <section className="container-wide grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <AnimatedReveal>
          <p className="eyebrow mb-4">About TangerineTwist</p>
          <h1 className="h-display text-4xl leading-[1.08] md:text-5xl">
            A design studio that happens to print in three dimensions.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
            TangerineTwist began with a simple frustration: most 3D printed products looked like 3D
            printed products. We set out to build a studio where precision manufacturing and
            genuine design taste could coexist — resulting in lamps, idols and desk pieces that
            feel considered, not novel.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            Every product is designed in-house, printed on calibrated precision hardware, and
            finished by hand in our studio before it ships anywhere in India.
          </p>
        </AnimatedReveal>
        <AnimatedReveal delay={0.1} className="grid grid-cols-2 gap-4">
          <ProductImagePlaceholder
            icon="Sparkles"
            tone="charcoal"
            src="/images/story/story-1.jpg"
            alt="A hand sanding a freshly 3D-printed ribbed vase in the studio"
            className="aspect-[3/4] rounded-3xl shadow-lift"
          />
          <ProductImagePlaceholder
            icon="Lamp"
            tone="warm"
            src="/images/story/story-2.jpg"
            alt="A 3D printer building a fluted vase layer by layer"
            className="mt-8 aspect-[3/4] rounded-3xl shadow-lift"
          />
        </AnimatedReveal>
      </section>

      <section className="bg-beige py-20">
        <div className="container-wide grid grid-cols-1 gap-8 md:grid-cols-2">
          <AnimatedReveal className="rounded-3xl bg-warm-white p-10 shadow-card">
            <p className="eyebrow mb-3">Our Mission</p>
            <p className="h-display text-2xl leading-snug">
              Empowering beautiful everyday living through innovative 3D printed design.
            </p>
          </AnimatedReveal>
          <AnimatedReveal delay={0.1} className="rounded-3xl bg-charcoal p-10 text-cream shadow-card">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-tangerine-400">Our Vision</p>
            <p className="h-display text-2xl leading-snug text-cream">
              To become India&apos;s most admired premium 3D printed lifestyle brand.
            </p>
          </AnimatedReveal>
        </div>
      </section>

      <section className="container-wide py-24">
        <SectionHeading eyebrow="What We Stand For" title="Values that shape every product" align="center" />
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <AnimatedReveal key={v.title} delay={i * 0.06}>
              <v.icon className="h-6 w-6 text-tangerine-600" strokeWidth={1.5} />
              <h3 className="mt-4 text-base font-medium text-charcoal">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      <Craftsmanship />

      <section className="container-wide pb-24 pt-4 text-center">
        <Button variant="accent" size="lg" asChild>
          <Link href="/lamps">
            Explore the Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
