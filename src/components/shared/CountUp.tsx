"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";

/**
 * Counts a number up when it scrolls into view.
 *
 * Renders the *final* value on both server and client so hydration always
 * matches and the real number is in the HTML for crawlers and no-JS visitors.
 * The count-from-zero is applied by the effect after mount, never during render.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const nodeRef = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-64px" });

  const format = React.useCallback(
    (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`,
    [prefix, decimals, suffix]
  );

  // Reset to zero only after mount, so SSR and first client render agree.
  React.useEffect(() => {
    if (reduced || !nodeRef.current) return;
    nodeRef.current.textContent = format(0);
  }, [reduced, format]);

  React.useEffect(() => {
    if (!inView || reduced || !nodeRef.current) return;
    const node = nodeRef.current;
    const controls = animate(0, value, {
      duration,
      ease: EASE_PREMIUM,
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, duration, format]);

  return (
    <span ref={ref} className={className}>
      <span ref={nodeRef}>{format(value)}</span>
    </span>
  );
}
