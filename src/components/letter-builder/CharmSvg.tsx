"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { BuilderConfig, Design, DesignPiece } from "@/lib/letter-builder/types";
import { HEART, colorHex } from "@/lib/letter-builder/design";
import { cn } from "@/lib/utils";
import {
  AccentBead,
  BEAD,
  BeadShape,
  KEY,
  KeyFrame,
  KeycapShape,
  Knot,
  Rope,
  SplitRing,
  StarClip,
  beadLayout,
  keyLayout,
} from "./parts";

const ACCENT_COLORS = ["pink", "lilac"];

/**
 * A finished bead keychain or keycap clicker, as one scalable SVG — the builder preview
 * (pieces tappable, new ones slide on as you type) and any static thumbnail. Pieces present
 * on first render don't animate, so server HTML matches the first client render.
 */
export function CharmSvg({
  design,
  config,
  ghost = false,
  selectedIndex = null,
  onSelect,
  className,
}: {
  design: Design;
  config: BuilderConfig;
  ghost?: boolean;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const n = design.pieces.length;
  const trim = colorHex(config, design.trim);
  const isKey = design.format === "clicker";
  const beads = beadLayout(n);
  const keys = keyLayout(n);
  const viewBox = (isKey ? keys.viewBox : beads.viewBox).join(" ");
  const slots = isKey ? keys.slots : beads.slots;
  const half = (isKey ? KEY.size : BEAD.h) / 2;

  return (
    <svg viewBox={viewBox} className={cn("h-auto w-full overflow-visible", ghost && "opacity-40 grayscale", className)} role="img" aria-label={label(design)}>
      {isKey ? (
        <KeyFrame layout={keys} hex={trim} />
      ) : (
        <g>
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
              <AccentBead hex={colorHex(config, ACCENT_COLORS[i % ACCENT_COLORS.length])} />
            </g>
          ))}
          <g transform={`translate(${beads.rightKnot} 0)`}>
            <Knot hex={trim} />
          </g>
          <g transform={`translate(${beads.tailKnot.x} ${beads.tailKnot.y})`}>
            <Knot hex={trim} scale={0.85} />
          </g>
        </g>
      )}

      <AnimatePresence initial={false}>
        {design.pieces.map((piece, i) => {
          const selected = selectedIndex === i;
          return (
            <motion.g
              key={i}
              initial={{ x: slots[i] + (reduced ? 0 : 140), y: 0, opacity: 0 }}
              animate={{ x: slots[i], y: selected && !reduced ? -10 : 0, opacity: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : -50 }}
              transition={{ type: "spring", stiffness: reduced ? 1000 : 320, damping: reduced ? 100 : 24 }}
            >
              <Piece
                piece={piece}
                index={i}
                config={config}
                isKey={isKey}
                selected={selected}
                half={half}
                onSelect={onSelect}
              />
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}

function Piece({
  piece,
  index,
  config,
  isKey,
  selected,
  half,
  onSelect,
}: {
  piece: DesignPiece;
  index: number;
  config: BuilderConfig;
  isKey: boolean;
  selected: boolean;
  half: number;
  onSelect?: (index: number) => void;
}) {
  const shape = isKey ? <KeycapShape piece={piece} config={config} /> : <BeadShape piece={piece} config={config} />;
  // Selected marker below the piece; the same marker shows on keyboard focus.
  const marker = (
    <rect
      x={-22}
      y={half + 18}
      width={44}
      height={8}
      rx={4}
      fill="#E86A2C"
      className={selected ? "opacity-100" : "opacity-0 group-focus-visible:opacity-100"}
    />
  );
  if (!onSelect) return shape;
  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Piece ${index + 1}: ${piece.char === HEART ? "heart" : piece.char}. Change just this one.`}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(index);
        }
      }}
      whileTap={{ y: isKey ? 6 : 3 }}
      className="group cursor-pointer outline-none"
    >
      {shape}
      {marker}
    </motion.g>
  );
}

function label(design: Design): string {
  const word = design.pieces.map((p) => (p.char === HEART ? "♥" : p.char)).join("");
  return `${design.format === "clicker" ? "Keycap clicker" : "Bead keychain"} spelling ${word || "nothing yet"}`;
}
