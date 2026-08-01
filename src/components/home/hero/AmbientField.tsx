"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

/**
 * Two very large, very slow tangerine washes behind the hero. Long durations and low
 * opacity keep this below conscious notice — it reads as the page breathing, not as
 * an animation.
 *
 * Lifted out of the old Hero.tsx unchanged, plus one addition: the washes brighten
 * over the back half of the scroll, so the room appears to warm as the lamp ignites.
 */
export function AmbientField({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  // The washes still render when motion is reduced (they're part of the visual
  // design, not the animation) — only the drift is dropped. Rendering the same
  // DOM either way also keeps hydration consistent.
  const drift = (x: number[], y: number[], duration: number) =>
    reduced
      ? {}
      : { animate: { x, y }, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } };

  const warmA = useTransform(progress, [0.6, 1], [0.18, 0.3]);
  const warmB = useTransform(progress, [0.6, 1], [0.14, 0.26]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #F0A164 0%, transparent 70%)",
          opacity: warmA,
        }}
        {...drift([0, 40, 0], [0, 28, 0], 26)}
      />
      <motion.div
        className="absolute -bottom-56 right-[-10rem] h-[38rem] w-[38rem] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #E86A2C 0%, transparent 70%)",
          opacity: warmB,
        }}
        {...drift([0, -34, 0], [0, -22, 0], 32)}
      />
    </div>
  );
}
