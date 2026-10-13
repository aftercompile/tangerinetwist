"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { BuilderConfig, BuilderFormatId, DesignPiece } from "@/lib/letter-builder/types";
import { HEART } from "@/lib/letter-builder/design";
import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { BUILDER_FONTS } from "./fonts";

// Darken (amount < 0) or lighten a hex colour — used for each piece's printed "extrusion".
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// A stack of 1px offsets reads as a solid printed piece with real thickness, not flat text.
function extrusion(hex: string, depth = 5): string {
  const side = shade(hex, -0.32);
  const layers = Array.from({ length: depth }, (_, i) => `0 ${(i + 1) * 0.012}em 0 ${side}`);
  return [...layers, `0 ${(depth + 2) * 0.012}em 0.06em rgba(27,24,21,0.22)`].join(", ");
}

/** One printed piece: a letter, number or heart in its style and colour. */
export function Piece({ piece, config, ghost = false }: { piece: DesignPiece; config: BuilderConfig; ghost?: boolean }) {
  const color = config.colors.find((c) => c.id === piece.color)?.hex ?? "#999999";
  const style = config.styles.find((s) => s.id === piece.style);
  const fontFamily = BUILDER_FONTS[style?.font ?? "lilita"];
  const fill = ghost ? "#E4D8C3" : color;

  if (piece.char === HEART) {
    const side = shade(fill, -0.32);
    return (
      <svg viewBox="0 0 32 30" aria-hidden className="inline-block h-[0.78em] w-auto align-[-0.02em]">
        <path d="M16 29 C 6 21, 0 15, 0 9 A 8 8 0 0 1 16 6 A 8 8 0 0 1 32 9 C 32 15, 26 21, 16 29 Z" transform="translate(0 1)" fill={side} />
        <path d="M16 28 C 6 20, 0 14, 0 8 A 8 8 0 0 1 16 5 A 8 8 0 0 1 32 8 C 32 14, 26 20, 16 28 Z" fill={fill} />
      </svg>
    );
  }

  return (
    <span aria-hidden style={{ fontFamily, color: fill, textShadow: ghost ? "none" : extrusion(fill) }}>
      {piece.char}
    </span>
  );
}

/**
 * A whole keychain or clicker, sized to fit its container (container-query units), so the
 * same component works as the hero showpiece, the builder preview and a cart thumbnail.
 * Pieces animate in/out when they change; pieces present on first render don't, so server
 * HTML and the first client render match.
 */
export function Charm({
  pieces,
  format,
  config,
  ghost = false,
  selectedIndex = null,
  onSelect,
  maxSize = "6rem",
  pieceKey = (i, p) => `${i}-${p.char}`,
  className,
}: {
  pieces: DesignPiece[];
  format: BuilderFormatId;
  config: BuilderConfig;
  ghost?: boolean;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  maxSize?: string;
  pieceKey?: (index: number, piece: DesignPiece) => string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  // Short words shouldn't balloon: size as if there were at least 4 pieces.
  const slots = Math.max(pieces.length, 4);
  const perPiece = format === "clicker" ? 1.18 : 0.78;
  const fontSize = `min(${maxSize}, calc(84cqw / ${slots * perPiece + 0.9}))`;

  return (
    <div className={cn("w-full [container-type:inline-size]", className)}>
      <div className="flex items-center justify-center" style={{ fontSize }}>
        <Ring format={format} />
        <div
          className={cn(
            "flex items-center leading-none",
            format === "clicker" ? "gap-[0.08em] rounded-[0.28em] bg-charcoal p-[0.1em] shadow-[0_0.12em_0.3em_rgba(27,24,21,0.25)]" : "gap-[0.02em]"
          )}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {pieces.map((piece, i) => {
              const selected = selectedIndex === i;
              const inner =
                format === "clicker" ? (
                  <span className="flex h-[1.1em] w-[1.1em] items-center justify-center rounded-[0.2em] bg-warm-white shadow-[inset_0_-0.07em_0_rgba(27,24,21,0.18)] transition-transform duration-150 ease-out group-active:translate-y-[0.05em]">
                    <span className="text-[0.78em] leading-none">
                      <Piece piece={piece} config={config} ghost={ghost} />
                    </span>
                  </span>
                ) : (
                  <Piece piece={piece} config={config} ghost={ghost} />
                );

              return (
                <motion.span
                  key={pieceKey(i, piece)}
                  layout={!reduced}
                  initial={{ opacity: 0, y: reduced ? 0 : "-0.6em", scale: reduced ? 1 : 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: reduced ? 0 : "0.4em", scale: reduced ? 1 : 0.85 }}
                  transition={{ duration: reduced ? 0 : 0.45, ease: EASE_PREMIUM }}
                  className="relative inline-flex"
                >
                  {onSelect ? (
                    <button
                      type="button"
                      onClick={() => onSelect(i)}
                      aria-label={`Piece ${i + 1}: ${piece.char === HEART ? "heart" : piece.char}. Tap to change just this one.`}
                      aria-pressed={selected}
                      className={cn(
                        "group relative inline-flex rounded-[0.18em] outline-none transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-tangerine-500",
                        selected && "-translate-y-[0.08em]"
                      )}
                    >
                      {inner}
                      {selected && (
                        <span aria-hidden className="absolute -bottom-[0.22em] left-1/2 h-[0.07em] w-[0.5em] -translate-x-1/2 rounded-full bg-tangerine-500" />
                      )}
                    </button>
                  ) : (
                    <span className="group inline-flex">{inner}</span>
                  )}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// A split ring for the keychain; a smaller ring on the clicker's body.
function Ring({ format }: { format: BuilderFormatId }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className={cn("shrink-0", format === "clicker" ? "-mr-[0.04em] h-[0.6em] w-[0.6em]" : "-mr-[0.08em] h-[0.75em] w-[0.75em]")}
    >
      <circle cx="18" cy="20" r="14" fill="none" stroke="#B9B2A8" strokeWidth="4" />
      <circle cx="18" cy="20" r="14" fill="none" stroke="#E9E4DC" strokeWidth="1.5" strokeDasharray="20 70" />
      <rect x="31" y="17" width="9" height="6" rx="3" fill="#B9B2A8" />
    </svg>
  );
}
