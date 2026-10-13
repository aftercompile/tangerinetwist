// The letter builder: a customer spells a word from individually printed pieces (A–Z, 0–9,
// ♥). Every piece has two colours — the bead/keycap body and the raised letter on it — plus
// a style (the font it's modelled from). The design also picks a format (beads on a cord,
// or keycaps in a frame) and a trim colour (the cord or the frame). These types are shared
// by the builder UI and, later, the server (pricing/validation) and the order snapshot.

export interface BuilderStyle {
  id: string;
  label: string;
  // Which font the physical pieces are modelled from — the preview renders with the same
  // font so what the customer sees is what gets printed.
  font: string;
}

export interface BuilderColor {
  id: string;
  label: string;
  hex: string;
  // Off when that filament runs out; existing designs using it can't be ordered.
  available: boolean;
}

export type BuilderFormatId = "keychain" | "clicker";

export interface BuilderFormat {
  id: BuilderFormatId;
  label: string;
  blurb: string;
  // What the trim colour is called for this format: the cord, or the keycap frame.
  trimLabel: string;
  basePrice: number; // rupees: cord, clip and accents — or the clicker frame
}

export interface BuilderPreset {
  id: string;
  label: string;
  // Body colours cycled across the word (one entry = every piece that colour), and the
  // letter colour used on all of them.
  bodies: string[];
  ink: string;
  trim: string;
}

export interface BuilderConfig {
  styles: BuilderStyle[];
  colors: BuilderColor[];
  formats: BuilderFormat[];
  presets: BuilderPreset[];
  perPiecePrice: number; // rupees per letter/number/heart
  maxPieces: number;
}

// One printed piece. `char` is A–Z, 0–9 or ♥.
export interface DesignPiece {
  char: string;
  style: string;
  body: string; // colour id of the bead/keycap
  ink: string; // colour id of the raised letter
}

export interface Design {
  format: BuilderFormatId;
  trim: string; // colour id of the cord (keychain) or frame (clicker)
  pieces: DesignPiece[];
}
