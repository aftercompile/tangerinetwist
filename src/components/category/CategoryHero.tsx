"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MouseParallax } from "@/components/shared/MouseParallax";
import { TextReveal } from "@/components/shared/TextReveal";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { CategoryParallaxImage } from "./CategoryParallaxImage";
import type { CategoryMeta } from "@/lib/types";

const HERO_ICON_MAP: Record<string, string> = {
  lamp: "Lamp",
  sparkles: "Sparkles",
  "layout-grid": "LayoutGrid",
};

const HERO_TONE: Record<string, "warm" | "charcoal" | "cool"> = {
  lamps: "warm",
  idols: "charcoal",
  "desk-organizers": "cool",
};

const HERO_IMAGE: Record<string, string> = {
  lamps: "/images/banners/banner-lamps.jpg",
  idols: "/images/banners/banner-idols.jpg",
  "desk-organizers": "/images/banners/banner-desk-organizers.jpg",
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Replaces CategoryBanner — full-viewport cinematic hero with scroll parallax
// (CategoryParallaxImage), cursor drift (MouseParallax), grain, and floating
// ambient light. Deliberately identical DOM under prefers-reduced-motion (only
// the travel ranges collapse to 0) — see the shared motion primitives' own
// comments for why that matters for hydration.
export function CategoryHero({ category }: { category: CategoryMeta }) {
  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-charcoal">
      <MouseParallax strength={14} className="absolute inset-0">
        <CategoryParallaxImage
          icon={HERO_ICON_MAP[category.heroIcon] ?? "Sparkles"}
          tone={HERO_TONE[category.slug] ?? "charcoal"}
          src={HERO_IMAGE[category.slug]}
          alt={category.name}
          travel={60}
        />
      </MouseParallax>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-charcoal/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <AmbientLights />

      <div className="container-wide absolute inset-x-0 bottom-0 pb-16 md:pb-20">
        <AnimatedReveal direction="none" className="mb-4">
          <p className="eyebrow text-tangerine-300">{category.tagline}</p>
        </AnimatedReveal>
        <TextReveal
          immediate
          text={category.heroStatement || category.name}
          as="h1"
          className="h-display max-w-3xl text-4xl leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-[4.5rem]"
        />
        <AnimatedReveal delay={0.5} className="mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
          {category.description}
        </AnimatedReveal>
      </div>
    </section>
  );
}

/** Two large, very slow tangerine washes — the hero equivalent of the homepage's AmbientField. */
function AmbientLights() {
  const reduced = useReducedMotion();
  const drift = (x: number[], y: number[], duration: number) =>
    reduced ? {} : { animate: { x, y }, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full opacity-[0.2] blur-3xl"
        style={{ background: "radial-gradient(circle, #F0A164 0%, transparent 70%)" }}
        {...drift([0, 30, 0], [0, 20, 0], 22)}
      />
      <motion.div
        className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "radial-gradient(circle, #E86A2C 0%, transparent 70%)" }}
        {...drift([0, -26, 0], [0, -16, 0], 28)}
      />
    </div>
  );
}
