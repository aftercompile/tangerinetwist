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

type PieceLook = Pick<DesignPiece, "style" | "body" | "ink">;

// Builder state is "a base look plus per-piece exceptions", not a list of pieces, so that
// retyping the word keeps the look: new pieces follow the base/preset, and only pieces the
// customer explicitly edited keep their own style or colours.
export interface BuilderState {
  text: string;
  format: Design["format"];
  trim: string;
  style: string; // base style for every piece
  body: string; // base body colour (used when no preset is active)
  ink: string; // letter colour for every piece
  preset: string | null; // body-colour pattern cycled across pieces
  overrides: Record<number, Partial<PieceLook>>;
}

export function initialState(config: BuilderConfig, text = "", presetId?: string): BuilderState {
  const preset = config.presets.find((p) => p.id === presetId) ?? config.presets[0];
  const firstAvailable = config.colors.find((c) => c.available)?.id ?? config.colors[0].id;
  return {
    text,
    format: config.formats[0].id,
    trim: preset?.trim ?? firstAvailable,
    style: config.styles[0].id,
    body: preset?.bodies[0] ?? firstAvailable,
    ink: preset?.ink ?? firstAvailable,
    preset: preset?.id ?? null,
    overrides: {},
  };
}

/** Applies a preset's colours (bodies, letters, trim) and drops per-piece colour edits. */
export function withPreset(config: BuilderConfig, state: BuilderState, presetId: string): BuilderState {
  const preset = config.presets.find((p) => p.id === presetId);
  if (!preset) return state;
  return { ...state, preset: preset.id, ink: preset.ink, trim: preset.trim, overrides: strip(state.overrides, ["body", "ink"]) };
}

function presetBody(config: BuilderConfig, presetId: string | null, index: number): string | null {
  const preset = config.presets.find((p) => p.id === presetId);
  if (!preset || preset.bodies.length === 0) return null;
  return preset.bodies[index % preset.bodies.length];
}

/** The actual pieces, derived from state. */
export function derivePieces(config: BuilderConfig, state: BuilderState): DesignPiece[] {
  return Array.from(state.text).map((char, i) => ({
    char,
    style: state.overrides[i]?.style ?? state.style,
    body: state.overrides[i]?.body ?? presetBody(config, state.preset, i) ?? state.body,
    ink: state.overrides[i]?.ink ?? state.ink,
  }));
}

/** Drops exceptions for positions that no longer exist after the word got shorter. */
export function withText(state: BuilderState, text: string): BuilderState {
  const length = Array.from(text).length;
  const overrides = Object.fromEntries(Object.entries(state.overrides).filter(([i]) => Number(i) < length));
  return { ...state, text, overrides };
}

/** Removes the given keys from every per-piece exception (dropping now-empty ones). */
export function strip(overrides: BuilderState["overrides"], keys: (keyof PieceLook)[]): BuilderState["overrides"] {
  return Object.fromEntries(
    Object.entries(overrides)
      .map(([i, o]) => {
        const rest = { ...o };
        for (const k of keys) delete rest[k];
        return [i, rest] as const;
      })
      .filter(([, o]) => Object.keys(o).length > 0)
  );
}

export function priceDesign(config: BuilderConfig, design: Pick<Design, "format" | "pieces">): number {
  const format = config.formats.find((f) => f.id === design.format) ?? config.formats[0];
  return format.basePrice + config.perPiecePrice * design.pieces.length;
}

/** Lowest possible price — what "from ₹X" advertises (one piece, cheapest format). */
export function startingPrice(config: BuilderConfig): number {
  return Math.min(...config.formats.map((f) => f.basePrice)) + config.perPiecePrice;
}

/** Pieces (by index) using a colour or style that's been switched off since. */
export function unavailablePieces(config: BuilderConfig, pieces: DesignPiece[]): number[] {
  const colors = new Map(config.colors.map((c) => [c.id, c]));
  const styles = new Set(config.styles.map((s) => s.id));
  const ok = (id: string) => colors.get(id)?.available === true;
  return pieces.flatMap((p, i) => (!ok(p.body) || !ok(p.ink) || !styles.has(p.style) ? [i] : []));
}

export function colorHex(config: BuilderConfig, id: string): string {
  return config.colors.find((c) => c.id === id)?.hex ?? "#CCCCCC";
}

/** A ready-made design for showcases (hero, story sections). */
export function showcaseDesign(config: BuilderConfig, text: string, presetId: string, style?: string, format?: Design["format"]): Design {
  const state = { ...initialState(config, text, presetId), ...(style ? { style } : {}), ...(format ? { format } : {}) };
  return { format: state.format, trim: state.trim, pieces: derivePieces(config, state) };
}

/**
 * A short, stable fingerprint of a design: two cart lines are the same line only if their
 * designs match piece for piece. Plain FNV-1a over a canonical string — no crypto needed,
 * it only has to tell designs apart, and it must run in the browser too.
 */
export function designKey(design: Design): string {
  const canonical = [design.format, design.trim, ...design.pieces.map((p) => `${p.char}.${p.style}.${p.body}.${p.ink}`)].join("|");
  let h = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** "ANYA — Bead keychain": what an order line shows in places that only have text. */
export function designLabel(config: BuilderConfig, design: Pick<Design, "format" | "pieces">): string {
  const word = design.pieces.map((p) => p.char).join("");
  const format = config.formats.find((f) => f.id === design.format)?.label ?? design.format;
  return `${word} — ${format}`;
}
