import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion language for the whole site.
 *
 * Every animation pulls its easing and duration from here so the entire product
 * moves with one rhythm — a section that invents its own curve reads as "off"
 * even when nobody can say why.
 */

/** Primary curve: a long, decelerating settle. Matches `ease-premium` in tailwind.config.ts. */
export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
/** Slightly tighter deceleration for smaller, faster elements. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** For elements leaving the screen — exits run faster than entrances. */
export const EASE_IN = [0.4, 0, 1, 1] as const;

export const DURATION = {
  /** Hover/press feedback. */
  fast: 0.2,
  /** Standard state changes. */
  base: 0.4,
  /** Content entrances. */
  slow: 0.7,
  /** Hero-scale reveals. */
  cinematic: 0.9,
} as const;

/** Exits should feel quicker than entrances (~65%) so the UI stays responsive. */
export const EXIT_RATIO = 0.65;

export const transitions = {
  reveal: { duration: DURATION.slow, ease: EASE_PREMIUM },
  hero: { duration: DURATION.cinematic, ease: EASE_PREMIUM },
  hover: { duration: DURATION.fast, ease: EASE_OUT },
  /** Physical, weighty settle for cursor-following and drag-like motion. */
  spring: { type: "spring", stiffness: 140, damping: 20, mass: 0.6 },
  /** Snappier spring for small interactive affordances. */
  springSnappy: { type: "spring", stiffness: 320, damping: 24, mass: 0.5 },
} satisfies Record<string, Transition>;

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

/**
 * Build reveal variants. When `reduced` is true every variant collapses to a
 * plain opacity fade with no displacement — motion-sensitive users still get
 * the content hierarchy, just without the travel.
 */
export function revealVariants(direction: RevealDirection = "up", reduced = false): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
    };
  }
  return {
    hidden: { opacity: 0, ...OFFSET[direction] },
    visible: { opacity: 1, x: 0, y: 0, transition: transitions.reveal },
  };
}

/**
 * Parent variant that sequences its children. Pair with `revealVariants` on the
 * children — the parent owns the timing, the children own the movement.
 */
export function staggerParent(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Per-item delay for long lists — keeps total reveal time from dragging. */
export function staggerDelay(index: number, step = 0.07, max = 0.45) {
  return Math.min(index * step, max);
}

/** Shared viewport config: fire once, slightly before the element is fully in view. */
export const VIEWPORT = { once: true, margin: "-72px" } as const;
