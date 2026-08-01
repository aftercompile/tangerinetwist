"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/shared/TextReveal";
import { TiltCard } from "@/components/shared/TiltCard";
import { Magnetic } from "@/components/shared/Magnetic";
import { CountUp } from "@/components/shared/CountUp";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";

const stats = [
  { value: 8, suffix: "K", label: "Resin Detail" },
  { value: 4.8, decimals: 1, suffix: "/5", label: "Average Rating" },
  { value: 3, suffix: "–4", label: "Days to Dispatch" },
];

export function Hero() {
  const reduced = useReducedMotion();

  // One shared timeline so copy, CTAs and imagery feel like a single entrance
  // rather than several components that happen to animate at once.
  const fade = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, delay: reduced ? 0 : delay, ease: EASE_PREMIUM },
  });

  return (
    <section className="relative overflow-hidden bg-cream">
      <AmbientField />

      <div className="container-wide relative grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <motion.p {...fade(0)} className="eyebrow mb-5 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-tangerine-500" />
            Premium 3D-Printed Design Studio
          </motion.p>

          <TextReveal
            immediate
            text={"Built light,\nlayer by layer."}
            delay={0.12}
            className="h-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem]"
          />

          <motion.p
            {...fade(0.45)}
            className="mt-6 max-w-md text-base leading-relaxed text-muted lg:text-lg"
          >
            Designer lamps, decorative idols and desk essentials — precision 3D printed and
            hand-finished in India, made for homes and workspaces that pay attention to detail.
          </motion.p>

          <motion.div {...fade(0.56)} className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Button variant="accent" size="lg" asChild>
                <Link href="/lamps" className="group">
                  Shop the Collection
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                </Link>
              </Button>
            </Magnetic>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Our Story</Link>
            </Button>
          </motion.div>

          <motion.dl
            {...fade(0.7)}
            className="mt-14 flex items-center gap-8 border-t border-border pt-8 sm:gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <CountUp
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    className="h-display block text-xl tabular-nums sm:text-2xl"
                  />
                  <span className="mt-0.5 block text-xs text-muted">{stat.label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <HeroLampArt reduced={!!reduced} />
      </div>

      <ScrollCue />
    </section>
  );
}

/**
 * The hero product shot: a real render of the Ganesh idol lamp, transparent
 * background. The source PNG is a 2400x1340 canvas with the subject occupying
 * only the centre ~37% of its width — framing it in an aspect-[2/3] box with
 * object-cover crops that dead transparent margin away instead of leaving the
 * lamp stranded in the middle of a wide, mostly-empty box.
 *
 * The glow behind it is CSS, not baked into the image: the source render has
 * no illumination effect, so a blurred warm wash stands in for the "lit lamp"
 * feel the art direction calls for. Same for the grounding shadow beneath the
 * base — a transparent cutout has no shadow of its own.
 */
function HeroLampArt({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: DURATION.cinematic, delay: reduced ? 0 : 0.3, ease: EASE_PREMIUM }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="relative aspect-[2/3]">
        {/* Warm glow standing in for the lamp's light source */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[38%] h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, #F0A164 0%, transparent 70%)" }}
        />
        {/* Grounding shadow — the render is a transparent cutout with none of its own */}
        <div
          aria-hidden
          className="absolute bottom-[6%] left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-[50%] opacity-25 blur-xl"
          style={{ background: "radial-gradient(ellipse, #1B1815 0%, transparent 72%)" }}
        />

        <TiltCard className="relative h-full w-full">
          <Image
            src="/images/hero/hero_main.png"
            alt="A 3D-printed table lamp with an intricately detailed Ganesh idol built into its base"
            fill
            priority
            sizes="(max-width: 1024px) 80vw, 40vw"
            className="object-contain object-center"
          />
        </TiltCard>
      </div>
    </motion.div>
  );
}

/**
 * Two very large, very slow tangerine washes behind the hero. Long durations
 * and low opacity keep this below conscious notice — it reads as the page
 * breathing, not as an animation.
 */
function AmbientField() {
  const reduced = useReducedMotion();
  // The washes still render when motion is reduced (they're part of the visual
  // design, not the animation) — only the drift is dropped. Rendering the same
  // DOM either way also keeps hydration consistent.
  const drift = (x: number[], y: number[], duration: number) =>
    reduced ? {} : { animate: { x, y }, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "radial-gradient(circle, #F0A164 0%, transparent 70%)" }}
        {...drift([0, 40, 0], [0, 28, 0], 26)}
      />
      <motion.div
        className="absolute -bottom-56 right-[-10rem] h-[38rem] w-[38rem] rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(circle, #E86A2C 0%, transparent 70%)" }}
        {...drift([0, -34, 0], [0, -22, 0], 32)}
      />
    </div>
  );
}

function ScrollCue() {
  const reduced = useReducedMotion();

  return (
    <motion.a
      href="#craftsmanship"
      aria-label="Scroll to explore"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.slow, delay: reduced ? 0 : 1 }}
      className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition-colors hover:text-charcoal lg:flex"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Explore</span>
      <motion.span
        animate={reduced ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-warm-white/70 backdrop-blur transition-colors group-hover:border-charcoal"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </motion.span>
    </motion.a>
  );
}
