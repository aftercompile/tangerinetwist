"use client";

import { motion, useReducedMotion } from "framer-motion";

// Fixed positions (not random) so server and client render the same DOM.
const SPARKS = [
  { x: "8%", y: "18%", s: 18, c: "#F7B2C6", d: 0 },
  { x: "46%", y: "12%", s: 12, c: "#C3B0F0", d: 0.8 },
  { x: "92%", y: "22%", s: 16, c: "#76CFD6", d: 1.6 },
  { x: "58%", y: "86%", s: 14, c: "#F7DE8C", d: 0.4 },
  { x: "16%", y: "88%", s: 12, c: "#A6E3C2", d: 1.2 },
  { x: "84%", y: "78%", s: 20, c: "#FBC6A4", d: 2 },
];

/** Decorative twinkling four-point stars behind a section. */
export function Sparkles() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {SPARKS.map((s, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ left: s.x, top: s.y, width: s.s, height: s.s }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={reduced ? { opacity: 0.6, scale: 1 } : { opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8], rotate: [0, 45, 90] }}
          transition={reduced ? { duration: 0 } : { duration: 3.2, repeat: Infinity, delay: s.d, ease: "easeInOut" }}
        >
          <path d="M12 0 C 13 8, 16 11, 24 12 C 16 13, 13 16, 12 24 C 11 16, 8 13, 0 12 C 8 11, 11 8, 12 0 Z" fill={s.c} />
        </motion.svg>
      ))}
    </div>
  );
}
