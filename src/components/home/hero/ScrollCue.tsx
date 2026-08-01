"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { DURATION } from "@/lib/motion";

/**
 * Lifted out of the old Hero.tsx. One change: instead of only fading *in* on mount,
 * it now fades *out* as soon as the user starts scrubbing — once the assembly is
 * under way the cue has done its job and would just compete with the lamp.
 */
export function ScrollCue({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const opacity = useTransform(progress, [0, 0.12], [1, 0]);

  return (
    <motion.a
      href="#craftsmanship"
      aria-label="Scroll to explore"
      style={{ opacity }}
      className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition-colors hover:text-charcoal lg:flex"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Explore</span>
      <motion.span
        animate={reduced ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: DURATION.slow * 2.85, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-warm-white/70 backdrop-blur transition-colors group-hover:border-charcoal"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </motion.span>
    </motion.a>
  );
}
