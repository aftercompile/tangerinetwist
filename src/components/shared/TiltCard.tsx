"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Subtle 3D tilt that tracks the cursor across the card.
 *
 * Rotation is clamped low (default 7deg) so the card reads as a physical object
 * catching light rather than a gimmick. Pointer-driven only — falls back to a
 * static card on touch devices and under prefers-reduced-motion.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 7,
  /** Slight lift toward the viewer on hover. */
  lift = 8,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  lift?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hovered = useMotionValue(0);

  // Zeroing the ranges rather than returning different JSX keeps the DOM
  // identical in both cases, so hydration never mismatches for visitors who
  // have reduced motion enabled.
  const tilt = reduced ? 0 : maxTilt;
  const depth = reduced ? 0 : lift;

  const spring = { stiffness: 220, damping: 22, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [tilt, -tilt]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-tilt, tilt]), spring);
  const z = useSpring(useTransform(hovered, [0, 1], [0, depth]), spring);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    // Coarse pointers (touch) have no meaningful hover position to track.
    if (reduced || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
    hovered.set(1);
  }

  function handlePointerLeave() {
    px.set(0);
    py.set(0);
    hovered.set(0);
  }

  return (
    <div ref={ref} className={cn("[perspective:1200px]", className)}>
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ rotateX, rotateY, z, transformStyle: "preserve-3d" }}
        className={cn("h-full w-full", !reduced && "will-change-transform")}
      >
        {children}
      </motion.div>
    </div>
  );
}
