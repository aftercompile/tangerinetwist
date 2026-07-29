"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked vertical parallax for decorative layers.
 *
 * Deliberately small travel (default ±8%) — enough to read as depth, not enough
 * to desync from the page or trigger motion sickness. Never wrap body copy or
 * interactive controls in this; it hurts reading comfort. Disabled entirely
 * under prefers-reduced-motion.
 */
export function Parallax({
  children,
  className,
  /** Percentage of the element's height to travel across the scroll range. Negative moves up. */
  speed = -8,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Collapsing the range to 0 (rather than returning different JSX) keeps the
  // rendered DOM identical in both cases, so hydration never mismatches for
  // visitors who have reduced motion enabled.
  const travel = reduced ? 0 : speed;
  const raw = useTransform(scrollYProgress, [0, 1], [`${-travel}%`, `${travel}%`]);
  // Smooth the scroll mapping so fast flicks don't snap the layer.
  const y = useSpring(raw, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <div ref={ref} className={cn(className)}>
      <motion.div style={{ y }} className={reduced ? undefined : "will-change-transform"}>
        {children}
      </motion.div>
    </div>
  );
}
