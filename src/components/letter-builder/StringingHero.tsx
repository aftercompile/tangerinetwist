"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderConfig, DesignPiece } from "@/lib/letter-builder/types";
import { colorHex, showcaseDesign, startingPrice } from "@/lib/letter-builder/design";
import { formatINR } from "@/lib/utils";
import { BUILDER_FONTS } from "./fonts";
import { AccentBead, BEAD, BeadShape, Knot, SplitRing, StarClip, beadLayout, shade } from "./parts";
import { Sparkles } from "./Sparkles";

// Names the hero strings, one after another — each a different colour look and style, so
// the hero itself says "every bead is your choice".
const NAMES = [
  { text: "ANYA", preset: "pastel", style: "rounded" },
  { text: "KABIR", preset: "candy", style: "rounded" },
  { text: "MOM♥", preset: "sorbet", style: "playful" },
  { text: "ZOYA", preset: "ocean", style: "block" },
];
const CAPACITY = 5; // the cord is laid out for 5 beads; shorter names sit centred on it
const CYCLE_MS = 6800;

// Deterministic pseudo-random, so scattered bead positions are identical on the server and
// in the browser's first render (no hydration mismatch).
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function scrollToBuilder() {
  document.getElementById("make-yours")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function StringingHero({ config }: { config: BuilderConfig }) {
  const reduced = useReducedMotion();
  const [cycle, setCycle] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const name = NAMES[cycle % NAMES.length];
  const design = showcaseDesign(config, name.text, name.preset, name.style);
  const trim = colorHex(config, design.trim);
  const layout = beadLayout(CAPACITY);
  const [vx, vy, vw, vh] = layout.viewBox;
  const offset = ((CAPACITY - design.pieces.length) / 2) * (BEAD.w + BEAD.gap);
  // The first string-up waits for the cord to draw itself; later ones only for the swap.
  const startDelay = cycle === 0 ? 1.1 : 0.5;
  const settle = startDelay + design.pieces.length * 0.13 + 1.3;
  const d = (s: number) => (reduced ? 0 : s);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_50%_at_78%_35%,#FDE1EA_0%,transparent_70%),radial-gradient(40%_45%_at_10%_75%,#DDF3EC_0%,transparent_70%),radial-gradient(35%_35%_at_50%_100%,#E9E1FB_0%,transparent_70%)]"
      />
      <Sparkles />

      <div className="container-wide relative grid min-h-[calc(100dvh-5rem)] grid-cols-1 items-center gap-6 py-10 lg:grid-cols-[0.9fr_1.35fr] lg:gap-6">
        <div className="order-2 lg:order-1">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.6), delay: d(0.1) }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-tangerine-600"
          >
            Personalised · 3D printed
          </motion.p>
          <h1
            className="mt-4 text-[2.9rem] leading-[0.98] text-charcoal sm:text-6xl lg:text-7xl"
            style={{ fontFamily: BUILDER_FONTS.lilita }}
          >
            {[
              { verb: "Spell", tint: "#D9547E" },
              { verb: "String", tint: "#2A9AA3" },
              { verb: "Swing", tint: "#7B61D6" },
            ].map((line, i) => (
              <motion.span
                key={line.verb}
                className="block"
                initial={{ opacity: 0, y: 24, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: d(0.15 + i * 0.12) }}
              >
                {line.verb} <span style={{ color: line.tint }}>it.</span>
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.6), delay: d(0.55) }}
            className="mt-5 max-w-md text-base leading-relaxed text-charcoal/70 lg:text-lg"
          >
            Pick every bead — its colour, its letter colour, its style. We print each one and string it into a keychain,
            or snap it into a clicker you won&apos;t stop pressing.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.6), delay: d(0.7) }}
            className="mt-8 flex flex-col items-start gap-4"
          >
            <Button variant="accent" size="lg" onClick={scrollToBuilder} className="shadow-[0_8px_0_#C4521C] active:translate-y-1 active:shadow-[0_4px_0_#C4521C]">
              Make yours — from {formatINR(startingPrice(config))}
              <ArrowDown className="h-4 w-4" />
            </Button>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-charcoal/70">
              {["A–Z · 0–9 · ♥", `${config.colors.length} colours`, "Ships in 3–4 days"].map((chip) => (
                <span key={chip} className="rounded-full border border-charcoal/10 bg-white/60 px-3 py-1.5 backdrop-blur-sm">
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-3xl lg:-mr-8">
            <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="h-auto w-full overflow-visible" role="img" aria-label={`A bead keychain spelling ${name.text}`}>
              {/* The whole keychain swings gently from its clip once strung. */}
              <motion.g
                initial={{ rotate: 0 }}
                animate={reduced ? { rotate: 0 } : { rotate: [0, -2.5, 2, -1.2, 0] }}
                transition={reduced ? { duration: 0 } : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3.2 }}
                style={{ transformOrigin: `${layout.clip.x - vx}px ${layout.clip.y - vy}px`, transformBox: "view-box" }}
              >
                <DrawnRope d={layout.ropeToClip} hex={trim} delay={d(0.35)} duration={d(0.6)} />
                <DrawnRope d={layout.ropeMain} hex={trim} delay={d(0.75)} duration={d(0.8)} />
                <DrawnRope d={layout.tail} hex={trim} delay={d(1.4)} duration={d(0.5)} />

                <Pop at={layout.ring} delay={d(0.3)}>
                  <SplitRing />
                </Pop>
                <Pop at={layout.clip} delay={d(0.15)} rotate={-12}>
                  <StarClip hex={colorHex(config, "aqua")} />
                </Pop>
                <Pop at={{ x: layout.leftKnot, y: 0 }} delay={d(0.85)}>
                  <Knot hex={trim} />
                </Pop>

                <AnimatePresence>
                  {design.pieces.map((piece, i) => (
                    <FlyingBead
                      key={`${cycle}-${i}`}
                      piece={piece}
                      config={config}
                      to={layout.slots[i] + offset}
                      seed={cycle * 37 + i * 11 + 1}
                      bounds={{ x: vx, w: vw }}
                      delay={d(startDelay + i * 0.13)}
                      reduced={!!reduced}
                    />
                  ))}
                </AnimatePresence>

                {/* Accents and the end knot roll in after the last letter lands. */}
                <AnimatePresence>
                  {layout.accents.map((x, i) => (
                    <motion.g
                      key={`${cycle}-accent-${i}`}
                      initial={{ x: x + 160, y: 0, opacity: 0, rotate: 200 }}
                      animate={{ x, y: 0, opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, transition: { duration: d(0.25) } }}
                      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 14, delay: settle - 0.9 + i * 0.12 }}
                    >
                      <AccentBead hex={colorHex(config, i === 0 ? design.pieces[0]?.body ?? "pink" : "lilac")} />
                    </motion.g>
                  ))}
                </AnimatePresence>
                <Pop at={{ x: layout.rightKnot, y: 0 }} delay={d(1.3)}>
                  <Knot hex={trim} />
                </Pop>
                <Pop at={layout.tailKnot} delay={d(1.85)}>
                  <Knot hex={trim} scale={0.85} />
                </Pop>
              </motion.g>
            </svg>
            <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50 lg:-mt-4">
              Bead keychain · {config.presets.find((p) => p.id === name.preset)?.label} ·{" "}
              {config.styles.find((s) => s.id === name.style)?.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A cord that draws itself along its length. */
function DrawnRope({ d, hex, delay, duration }: { d: string; hex: string; delay: number; duration: number }) {
  // Opacity too: a round line cap draws a dot even at zero length, which would show up
  // before the cord starts drawing.
  const draw = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration, delay, ease: "easeInOut" as const }, opacity: { duration: 0.01, delay } },
  };
  return (
    <g>
      <motion.path d={d} fill="none" stroke={shade(hex, -0.22)} strokeWidth={26} strokeLinecap="round" {...draw} />
      <motion.path d={d} fill="none" stroke={hex} strokeWidth={20} strokeLinecap="round" {...draw} />
      {/* The woven highlight fades in after, since pathLength would override its dashes. */}
      <motion.path
        d={d}
        fill="none"
        stroke={shade(hex, 0.45)}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="5 13"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.3, delay: delay + duration }}
      />
    </g>
  );
}

/** Pops a part into place with a little springy scale. */
function Pop({ at, delay, rotate = 0, children }: { at: { x: number; y: number }; delay: number; rotate?: number; children: React.ReactNode }) {
  return (
    <g transform={`translate(${at.x} ${at.y}) rotate(${rotate})`}>
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 16, delay }}
      >
        {children}
      </motion.g>
    </g>
  );
}

/**
 * One letter bead: appears floating somewhere around the stage, hangs there a beat, then
 * flies onto its spot on the cord and lands with a little overshoot. On the way out (next
 * name) it tumbles off somewhere else.
 */
function FlyingBead({
  piece,
  config,
  to,
  seed,
  bounds,
  delay,
  reduced,
}: {
  piece: DesignPiece;
  config: BuilderConfig;
  to: number;
  seed: number;
  bounds: { x: number; w: number };
  delay: number;
  reduced: boolean;
}) {
  const sx = bounds.x + 80 + rand(seed) * (bounds.w - 160);
  const sy = -200 + rand(seed + 1) * 340;
  const sr = -45 + rand(seed + 2) * 90;
  const ex = bounds.x + 80 + rand(seed + 3) * (bounds.w - 160);
  const ey = rand(seed + 4) > 0.5 ? 320 : -320;

  return (
    <motion.g
      initial={{ x: sx, y: sy, rotate: sr, opacity: 0, scale: 0.6 }}
      animate={{
        x: reduced ? to : [sx, sx, to],
        y: reduced ? 0 : [sy, sy - 14, 0],
        rotate: reduced ? 0 : [sr, sr + 8, 0],
        opacity: 1,
        scale: reduced ? 1 : [0.6, 1, 1],
      }}
      exit={{
        x: ex,
        y: ey,
        rotate: sr * 2,
        opacity: 0,
        transition: { duration: reduced ? 0 : 0.7, ease: [0.55, 0, 0.75, 0.2] },
      }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 1.5, delay, times: [0, 0.4, 1], ease: ["easeOut", [0.34, 1.45, 0.64, 1]] }
      }
    >
      <BeadShape piece={piece} config={config} />
    </motion.g>
  );
}
