"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { BuilderConfig, DesignPiece } from "@/lib/letter-builder/types";
import { colorHex, showcaseDesign } from "@/lib/letter-builder/design";
import { BUILDER_FONTS } from "./fonts";
import {
  AccentBead,
  BeadShape,
  KeyFrame,
  KeycapShape,
  Knot,
  Rope,
  SplitRing,
  StarClip,
  beadLayout,
  keyLayout,
} from "./parts";

const WORD = "RIYA♥";

/**
 * "Two ways to carry it": a pinned, scroll-driven morph. Scrolling through the section lifts
 * the beads off the cord, squares them into keycaps and drops them — click — into the
 * clicker frame. With reduced motion the pieces don't travel; the two versions crossfade.
 */
export function TwoWaysSection({ config }: { config: BuilderConfig }) {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // useReducedMotion() can be false on the server and true on the client's first render;
  // the transforms below are rendered into the HTML, so only switch after mount.
  const prefersReduced = useReducedMotion();
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => setReduced(!!prefersReduced), [prefersReduced]);

  const design = showcaseDesign(config, WORD, "pastel", "rounded");
  const n = design.pieces.length;
  const beads = beadLayout(n);
  const keys = keyLayout(n);
  // Both versions centred on x = 0, so pieces travel between matching slots.
  const bOff = -beads.lettersWidth / 2;
  const kOff = -keys.lettersWidth / 2;
  const trim = colorHex(config, design.trim);

  const beadParts = useTransform(scrollYProgress, [0.22, 0.38], [1, 0]);
  const frameIn = useTransform(scrollYProgress, [0.42, 0.56], [0, 1]);
  const frameScale = useTransform(scrollYProgress, [0.42, 0.56], [reduced ? 1 : 0.9, 1]);
  const beadCaption = useTransform(scrollYProgress, [0.2, 0.32], [1, 0]);
  const keyCaption = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);

  return (
    <section ref={ref} className="relative h-[280vh] bg-[linear-gradient(180deg,#FBF8F3_0%,#F3EEFB_50%,#FBF8F3_100%)]">
      <div className="sticky top-20 flex h-[calc(100dvh-5rem)] flex-col items-center justify-center overflow-hidden">
        <div className="container-wide text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tangerine-600">Two ways to carry it</p>
          <h2 className="mt-3 text-4xl leading-tight text-charcoal sm:text-5xl" style={{ fontFamily: BUILDER_FONTS.lilita }}>
            Strung on a cord, or clicked into keys.
          </h2>
        </div>

        <div className="relative mt-6 w-full max-w-4xl px-5">
          <svg viewBox="-640 -300 1280 560" className="h-auto w-full overflow-visible" role="img" aria-label={`The name ${WORD} as a bead keychain turning into a keycap clicker`}>
            <motion.g style={{ opacity: beadParts }} transform={`translate(${bOff} 0)`}>
              <Rope d={beads.ropeToClip} hex={trim} />
              <Rope d={beads.ropeMain} hex={trim} />
              <Rope d={beads.tail} hex={trim} />
              <g transform={`translate(${beads.ring.x} ${beads.ring.y})`}>
                <SplitRing />
              </g>
              <g transform={`translate(${beads.clip.x} ${beads.clip.y}) rotate(-12)`}>
                <StarClip hex={colorHex(config, "aqua")} />
              </g>
              <g transform={`translate(${beads.leftKnot} 0)`}>
                <Knot hex={trim} />
              </g>
              {beads.accents.map((x, i) => (
                <g key={i} transform={`translate(${x} 0)`}>
                  <AccentBead hex={colorHex(config, i ? "lilac" : "pink")} />
                </g>
              ))}
              <g transform={`translate(${beads.rightKnot} 0)`}>
                <Knot hex={trim} />
              </g>
              <g transform={`translate(${beads.tailKnot.x} ${beads.tailKnot.y})`}>
                <Knot hex={trim} scale={0.85} />
              </g>
            </motion.g>

            <g transform={`translate(${kOff} 0)`}>
              <motion.g style={{ opacity: frameIn, scaleY: frameScale, transformBox: "fill-box", transformOrigin: "center" }}>
                <KeyFrame layout={keys} hex={colorHex(config, "lilac")} />
              </motion.g>
            </g>

            {design.pieces.map((piece, i) => (
              <MorphPiece
                key={i}
                piece={piece}
                config={config}
                index={i}
                count={n}
                progress={scrollYProgress}
                fromX={bOff + beads.slots[i]}
                toX={kOff + keys.slots[i]}
                reduced={reduced}
              />
            ))}
          </svg>

          <div className="relative -mt-2 h-14 text-center">
            <motion.p style={{ opacity: beadCaption }} className="absolute inset-x-0 text-sm text-charcoal/70">
              <span className="font-semibold text-charcoal">Bead keychain</span> — chunky letter beads on soft paracord
            </motion.p>
            <motion.p style={{ opacity: keyCaption }} className="absolute inset-x-0 text-sm text-charcoal/70">
              <span className="font-semibold text-charcoal">Keycap clicker</span> — every letter is a key you can press
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MorphPiece({
  piece,
  config,
  index,
  count,
  progress,
  fromX,
  toX,
  reduced,
}: {
  piece: DesignPiece;
  config: BuilderConfig;
  index: number;
  count: number;
  progress: MotionValue<number>;
  fromX: number;
  toX: number;
  reduced: boolean;
}) {
  // Each piece lifts a beat after the one before it, so the morph ripples along the word.
  const lag = (index / Math.max(count - 1, 1)) * 0.06;
  const x = useTransform(progress, [0.3 + lag, 0.52 + lag], reduced ? [toX, toX] : [fromX, toX]);
  const y = useTransform(
    progress,
    [0.26 + lag, 0.38 + lag, 0.58 + lag, 0.68 + lag, 0.84 + lag, 0.88 + lag, 0.92 + lag],
    reduced ? [0, 0, 0, 0, 0, 0, 0] : [0, -110, -110, 0, 0, 8, 0]
  );
  const rotate = useTransform(progress, [0.3 + lag, 0.45 + lag, 0.6 + lag], reduced ? [0, 0, 0] : [0, index % 2 ? 10 : -10, 0]);
  const beadOpacity = useTransform(progress, [0.42 + lag, 0.5 + lag], [1, 0]);
  const keyOpacity = useTransform(progress, [0.42 + lag, 0.5 + lag], [0, 1]);

  return (
    <motion.g style={{ x, y, rotate }}>
      <motion.g style={{ opacity: beadOpacity }}>
        <BeadShape piece={piece} config={config} />
      </motion.g>
      <motion.g style={{ opacity: keyOpacity }}>
        <KeycapShape piece={{ ...piece, ink: "white" }} config={config} />
      </motion.g>
    </motion.g>
  );
}
