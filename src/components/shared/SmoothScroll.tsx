"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import BezierEasing from "bezier-easing";
import { EASE_PREMIUM } from "@/lib/motion";

// Mirrors EASE_PREMIUM (motion.ts) so momentum scroll settles with the same long,
// decelerating curve as every reveal on the site — a different feel here would read
// as "off" the same way an invented easing curve would anywhere else.
const lenisEasing = BezierEasing(...EASE_PREMIUM);

/**
 * Headless — mounted directly on the homepage (not the shared storefront layout),
 * so smooth scroll is scoped to "/" only. App Router unmounts page components (not
 * layouts) on navigation, so the Lenis instance is torn down automatically when the
 * user leaves the homepage.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.3,
      easing: lenisEasing,
      smoothWheel: true,
      autoRaf: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
