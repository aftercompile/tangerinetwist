"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Pulls its child gently toward the cursor on hover.
 *
 * Strength is clamped (default 0.25) so the element never escapes its own hit
 * box — the pull is felt, not chased. Use on at most one or two focal elements
 * per screen; applied broadly it turns a page into a noisy funhouse.
 */
export function Magnetic({
  children,
  className,
  strength = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const spring = { stiffness: 260, damping: 18, mass: 0.5 };
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    // Guarding inside the handler (rather than returning different JSX) keeps
    // the rendered DOM identical, so hydration never mismatches for visitors
    // who have reduced motion enabled.
    if (reduced || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={cn("w-fit", !reduced && "will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
