import type { BuilderConfig, Design, DesignPiece } from "./types";

export const HEART = "♥";
const ALLOWED = /[A-Z0-9♥]/;

/**
 * Turns whatever was typed or pasted into the pieces we can print: uppercase, only A–Z,
 * 0–9 and ♥ (a typed "<3" becomes a heart), capped at the piece limit. Spaces and anything
 * else are dropped rather than rejected, so typing feels forgiving.
 */
export function sanitizeText(raw: string, maxPieces: number): string {
  const chars = Array.from(raw.replace(/<3/g, HEART).toUpperCase()).filter((c) => ALLOWED.test(c));
  return chars.slice(0, maxPieces).join("");
}

// Builder state is "a base look plus per-piece exceptions", not a list of pieces, so that
// retyping the word keeps the look: new letters follow the base/preset, and only pieces the
// customer explicitly edited keep their own style or colour.
export interface BuilderState {
  text: string;
  format: Design["format"];
  style: string; // base style for every piece
  color: string; // base colour (used when no preset is active)
  preset: string | null; // colour pattern cycled across pieces
  overrides: Record<number, Partial<Pick<DesignPiece, "style" | "color">>>;
}

export function initialState(config: BuilderConfig, text = ""): BuilderState {
  return {
    text,
    format: config.formats[0].id,
    style: config.styles[0].id,
    color: config.colors.find((c) => c.available)?.id ?? config.colors[0].id,
    preset: config.presets[0]?.id ?? null,
    overrides: {},
  };
}

export function presetColor(config: BuilderConfig, presetId: string | null, index: number): string | null {
  const preset = config.presets.find((p) => p.id === presetId);
  if (!preset || preset.colors.length === 0) return null;
  return preset.colors[index % preset.colors.length];
}

/** The actual pieces, derived from state. */
export function derivePieces(config: BuilderConfig, state: BuilderState): DesignPiece[] {
  return Array.from(state.text).map((char, i) => ({
    char,
    style: state.overrides[i]?.style ?? state.style,
    color: state.overrides[i]?.color ?? presetColor(config, state.preset, i) ?? state.color,
  }));
}

/** Drops exceptions for positions that no longer exist after the word got shorter. */
export function withText(state: BuilderState, text: string): BuilderState {
  const length = Array.from(text).length;
  const overrides = Object.fromEntries(Object.entries(state.overrides).filter(([i]) => Number(i) < length));
  return { ...state, text, overrides };
}

export function priceDesign(config: BuilderConfig, design: Pick<Design, "format" | "pieces">): number {
  const format = config.formats.find((f) => f.id === design.format) ?? config.formats[0];
  return format.basePrice + config.perPiecePrice * design.pieces.length;
}

/** Lowest possible price — what "from ₹X" advertises (one piece, cheapest format). */
export function startingPrice(config: BuilderConfig): number {
  return Math.min(...config.formats.map((f) => f.basePrice)) + config.perPiecePrice;
}

/** Pieces whose colour or style has been switched off since the design was made. */
export function unavailablePieces(config: BuilderConfig, pieces: DesignPiece[]): number[] {
  const colors = new Map(config.colors.map((c) => [c.id, c]));
  const styles = new Set(config.styles.map((s) => s.id));
  return pieces.flatMap((p, i) => (!colors.get(p.color)?.available || !styles.has(p.style) ? [i] : []));
}
