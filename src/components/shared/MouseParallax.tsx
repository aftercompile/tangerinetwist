"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Subtle cursor-driven drift for large hero imagery — distinct from TiltCard's
 * per-card rotation, this tracks the pointer across its own bounds and nudges its
 * child a few pixels in response, like the image is floating just behind glass.
 * Pointer-driven only — falls back to a static child on touch devices and under
 * prefers-reduced-motion, with an identical DOM either way (see TiltCard).
 */
export function MouseParallax({
  children,
  className,
  /** Max travel in pixels at the container's edge. */
  strength = 18,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const range = reduced ? 0 : strength;
  const spring = { stiffness: 60, damping: 20, mass: 0.6 };
  const x = useSpring(useTransform(px, [-0.5, 0.5], [-range, range]), spring);
  const y = useSpring(useTransform(py, [-0.5, 0.5], [-range, range]), spring);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div ref={ref} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} className={cn(className)}>
      <motion.div style={{ x, y }} className={cn("h-full w-full", !reduced && "will-change-transform")}>
        {children}
      </motion.div>
    </div>
  );
}
