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

  // The starting state is identical for everyone — it's rendered into the server HTML,
  // and useReducedMotion() can be false on the server but true on the client's first
  // render, so branching it here caused a hydration mismatch. Motion-sensitive users
  // still get only a plain fade: their travel and defocus complete instantly (duration 0)
  // while opacity fades in.
  const initial = { opacity: 0, ...OFFSET[direction], ...(blur ? { filter: "blur(6px)" } : {}) };
  const animate = { opacity: 1, x: 0, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) };
  const instant = { duration: 0 };

  return (
    <Comp
      initial={initial}
      whileInView={animate}
      viewport={VIEWPORT}
      transition={{
        duration: reduced ? DURATION.base : DURATION.slow,
        delay: reduced ? 0 : delay,
        ease: reduced ? EASE_OUT : EASE_PREMIUM,
        ...(reduced ? { x: instant, y: instant, filter: instant } : {}),
      }}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}
