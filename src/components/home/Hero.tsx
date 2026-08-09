"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/shared/TextReveal";
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
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // No `autoPlay` attribute on the element itself — useReducedMotion() can
  // report false during SSR and flip true on the client's first render, so
  // baking a reduced-motion decision straight into an attribute risks a
  // hydration mismatch (the same trap every other motion primitive here
  // avoids by keeping the DOM identical and neutralizing behavior instead).
  // This effect is the one place playback is decided, after mount.
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Autoplay can still be blocked (data-saver mode, etc.) — the dark
        // scrim plus the video's own first frame still read fine as a
        // static hero if playback never starts.
      });
    }
  }, [reduced]);

  // One shared timeline so copy, CTAs and stats feel like a single entrance
  // rather than components that happen to animate at once.
  const fade = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, delay: reduced ? 0 : delay, ease: EASE_PREMIUM },
  });

  return (
    <section className="relative flex min-h-[80dvh] items-center overflow-hidden bg-charcoal sm:min-h-[85dvh] lg:min-h-[92vh]">
      {/* Video layer fades in on mount (the "subtle fade" the background asks
          for) instead of popping in the instant it's decoded. bg-charcoal on
          the section behind it is the fallback for the moment before the
          first frame paints, or if playback is ever blocked entirely. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.cinematic, ease: EASE_PREMIUM }}
        className="absolute inset-0"
      >
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Two scrim layers: a flat wash so text contrast holds no matter what
          the footage is doing at any given moment, plus a left-to-right
          gradient that goes darkest behind the text column and eases off
          toward the right so the video itself still reads through there. */}
      <div aria-hidden className="absolute inset-0 bg-charcoal/45" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/40 to-transparent lg:via-charcoal/25"
      />

      <div className="container-wide relative z-[1] py-16 sm:py-20">
        <div className="max-w-xl">
          <motion.p {...fade(0)} className="eyebrow mb-5 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-tangerine-400" />
            Premium 3D-Printed Design Studio
          </motion.p>

          <TextReveal
            immediate
            text={"Everyday living,\nbeautifully engineered."}
            delay={0.12}
            className="h-display text-[2.75rem] leading-[1.05] text-white sm:text-6xl lg:text-[4.25rem]"
          />

          <motion.p
            {...fade(0.45)}
            className="mt-6 max-w-md text-base leading-relaxed text-white/75 lg:text-lg"
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
            <Button variant="light" size="lg" asChild>
              <Link href="/about">Our Story</Link>
            </Button>
          </motion.div>

          <motion.dl
            {...fade(0.7)}
            className="mt-10 hidden items-center gap-8 border-t border-white/20 pt-8 sm:flex sm:gap-12 lg:mt-14"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <CountUp
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    className="h-display block text-xl tabular-nums text-white sm:text-2xl"
                  />
                  <span className="mt-0.5 block text-xs text-white/65">{stat.label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}

function ScrollCue() {
  const reduced = useReducedMotion();

  return (
    <motion.a
      href="#collections"
      aria-label="Scroll to explore"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.slow, delay: reduced ? 0 : 1 }}
      className="group absolute bottom-6 left-1/2 z-[1] hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-white lg:flex"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Explore</span>
      <motion.span
        animate={reduced ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition-colors group-hover:border-white/60"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </motion.span>
    </motion.a>
  );
}
