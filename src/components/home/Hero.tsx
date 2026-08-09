"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/shared/TextReveal";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";

/**
 * Deliberately spare: one headline, one line of copy, two CTAs over the film.
 * The stats row, eyebrow label, magnetic button and scroll cue that used to
 * live here were the "ecommerce banner" tells — a magazine cover doesn't
 * annotate itself.
 */
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

  // One shared timeline so copy and CTAs feel like a single entrance rather
  // than components that happen to animate at once.
  const fade = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, delay: reduced ? 0 : delay, ease: EASE_PREMIUM },
  });

  return (
    <section className="relative flex min-h-[78dvh] items-center overflow-hidden bg-charcoal sm:min-h-[82dvh] lg:min-h-[88vh]">
      {/* Video layer fades in on mount instead of popping in the instant it's
          decoded. bg-charcoal on the section behind it is the fallback for the
          moment before the first frame paints, or if playback is blocked. */}
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

      {/* One directional scrim, darkest behind the text column, plus a thin
          flat wash as insurance against bright moments in the footage — kept
          as light as legibility allows so the film stays the hero. */}
      <div aria-hidden className="absolute inset-0 bg-charcoal/30" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/35 to-transparent lg:via-charcoal/20"
      />

      <div className="container-wide relative z-[1] py-20 sm:py-24">
        <div className="max-w-xl">
          <TextReveal
            immediate
            text={"Objects worth\nkeeping."}
            delay={0.1}
            className="h-display text-5xl leading-[1.02] text-white sm:text-6xl lg:text-[4.75rem]"
          />

          <motion.p
            {...fade(0.4)}
            className="mt-6 max-w-md text-base leading-relaxed text-white/80 lg:text-lg"
          >
            3D printed pieces designed for everyday spaces.
          </motion.p>

          <motion.div {...fade(0.52)} className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="accent" size="lg" asChild>
              <Link href="/products" className="group">
                Shop all
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="light" size="lg" asChild>
              <Link href="/about">Our story</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
