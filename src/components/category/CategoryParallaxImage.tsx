"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { cn } from "@/lib/utils";

/**
 * A full-bleed cover image with scroll-linked vertical drift, for sections
 * that need the image to fill an absolutely-positioned container rather than
 * an aspect-ratio box (which is what the shared Parallax primitive assumes).
 *
 * The height chain here is deliberately plain block elements with real
 * percentage heights at every level (never relying on an ancestor's CSS
 * transform to establish a containing block) — the outer div is sized by
 * whatever positions it (absolute inset-0 against a real ancestor height),
 * and the inner motion.div gets an explicit 120% so the y-travel never
 * exposes an edge through the overflow-hidden clip.
 */
export function CategoryParallaxImage({
  icon,
  tone = "beige",
  src,
  alt,
  className,
  travel = 60,
}: {
  icon: string;
  tone?: "warm" | "cool" | "charcoal" | "beige";
  src?: string;
  alt: string;
  className?: string;
  travel?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const range = reduced ? 0 : travel;
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [-range, range]), {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  return (
    <div ref={ref} className={cn("h-full w-full overflow-hidden", className)}>
      <motion.div style={{ height: "120%", y }} className="w-full">
        <ProductImagePlaceholder icon={icon} tone={tone} src={src} alt={alt} className="h-full w-full" />
      </motion.div>
    </div>
  );
}
