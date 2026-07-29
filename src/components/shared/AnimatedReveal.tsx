"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION, EASE_OUT, EASE_PREMIUM, VIEWPORT, type RevealDirection } from "@/lib/motion";

const OFFSET: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

export function AnimatedReveal({
  children,
  className,
  delay = 0,
  as = "div",
  direction = "up",
  blur = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
  direction?: RevealDirection;
  /** Adds a slight defocus on entry — reserve for hero-level moments. */
  blur?: boolean;
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  // Motion-sensitive users get the same content and hierarchy, just as a plain
  // fade with no travel or defocus.
  const initial = reduced
    ? { opacity: 0 }
    : { opacity: 0, ...OFFSET[direction], ...(blur ? { filter: "blur(6px)" } : {}) };

  const animate = reduced
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) };

  return (
    <Comp
      initial={initial}
      whileInView={animate}
      viewport={VIEWPORT}
      transition={{
        duration: reduced ? DURATION.base : DURATION.slow,
        delay: reduced ? 0 : delay,
        ease: reduced ? EASE_OUT : EASE_PREMIUM,
      }}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}
