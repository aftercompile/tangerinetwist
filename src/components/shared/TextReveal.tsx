"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION, EASE_PREMIUM, VIEWPORT } from "@/lib/motion";

/**
 * Reveals a headline word-by-word from behind a mask.
 *
 * Word-level (not character-level) on purpose: it keeps the DOM small, keeps
 * the text readable to screen readers as real words, and avoids the "ransom
 * note" feel that per-character motion gives long copy. Reserve this for short
 * headlines — body paragraphs should use AnimatedReveal instead.
 */
export function TextReveal({
  text,
  className,
  as: Tag = "h1",
  delay = 0,
  stagger = 0.055,
  /** Renders on mount instead of on scroll — use for above-the-fold headlines. */
  immediate = false,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}) {
  const reduced = useReducedMotion();
  // Preserve author-intended line breaks: split lines first, then words.
  const lines = React.useMemo(() => text.split("\n").map((line) => line.split(" ")), [text]);

  // Reduced motion neutralizes the variants instead of returning different JSX,
  // so the rendered DOM stays identical and hydration never mismatches.
  let wordIndex = -1;
  const animationProps = immediate
    ? { initial: "hidden" as const, animate: "visible" as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: VIEWPORT };

  return (
    <Tag className={cn(className)}>
      {/* The visible text is aria-hidden and the full string is exposed once,
          so assistive tech reads a clean sentence rather than fragments. */}
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <motion.span aria-hidden className="inline" {...animationProps}>
        {lines.map((words, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {words.map((word, i) => {
              wordIndex += 1;
              return (
                <span
                  key={`${lineIdx}-${i}`}
                  // Mask: the child slides up from below this clipped box.
                  className="inline-block overflow-hidden align-bottom"
                  style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
                >
                  <motion.span
                    className="inline-block"
                    variants={
                      reduced
                        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
                        : {
                            hidden: { y: "110%" },
                            visible: {
                              y: 0,
                              transition: {
                                duration: DURATION.slow,
                                ease: EASE_PREMIUM,
                                delay: delay + wordIndex * stagger,
                              },
                            },
                          }
                    }
                  >
                    {word}
                    {i < words.length - 1 ? " " : ""}
                  </motion.span>
                </span>
              );
            })}
          </React.Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
