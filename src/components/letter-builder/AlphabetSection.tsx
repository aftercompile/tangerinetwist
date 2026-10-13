"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { BuilderConfig } from "@/lib/letter-builder/types";
import { colorHex } from "@/lib/letter-builder/design";
import { BUILDER_FONTS } from "./fonts";
import { shade } from "./parts";

const KEYS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", "♥"];
const PASTELS = ["pink", "lilac", "mint", "sky", "butter", "peach", "aqua"];

/**
 * "Every letter, every colour": the full piece set as pastel keycaps (like the reference
 * set). They pop in as the section scrolls into view, bounce on hover and click down when
 * tapped — the page's "go on, press it" moment.
 */
export function AlphabetSection({ config }: { config: BuilderConfig }) {
  const reduced = useReducedMotion();
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tangerine-600">Every piece</p>
          <h2 className="mt-3 text-4xl leading-tight text-charcoal sm:text-5xl" style={{ fontFamily: BUILDER_FONTS.lilita }}>
            26 letters. 10 numbers. One ♥.
          </h2>
          <p className="mt-4 text-base text-charcoal/70">
            Each one printed on its own in the colour you pick — the bead, and the letter on it. Go on, press one.
          </p>
        </div>

        {/* Flex-wrap (not a grid) so the short last row sits centred. */}
        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2.5 sm:gap-3">
          {KEYS.map((ch, i) => {
            const body = colorHex(config, PASTELS[i % PASTELS.length]);
            return (
              <motion.button
                key={ch}
                type="button"
                aria-label={ch === "♥" ? "Heart" : ch}
                // Same starting state for everyone (server HTML must match); reduced motion just
                // makes the pop-in instant.
                initial={{ opacity: 0, y: 30, scale: 0.7 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 18, delay: (i % 13) * 0.03 + Math.floor(i / 13) * 0.08 }}
                whileHover={reduced ? undefined : { y: -6, rotate: i % 2 ? 4 : -4 }}
                whileTap={{ y: 4, scale: 0.96 }}
                className="aspect-square w-[calc((100%-5*0.625rem)/6)] rounded-[22%] text-white outline-none focus-visible:ring-2 focus-visible:ring-tangerine-500 sm:w-[calc((100%-8*0.75rem)/9)] lg:w-[calc((100%-12*0.75rem)/13)]"
                style={{
                  background: `linear-gradient(180deg, ${shade(body, 0.18)} 0%, ${body} 70%)`,
                  boxShadow: `inset 0 -6px 0 ${shade(body, -0.18)}, 0 6px 14px -6px ${shade(body, -0.35)}`,
                }}
              >
                <span
                  className="block text-[clamp(1.1rem,4.2vw,1.9rem)] leading-none"
                  style={{ fontFamily: BUILDER_FONTS.lilita, textShadow: `0 2px 0 ${shade(body, -0.28)}` }}
                >
                  {ch}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
