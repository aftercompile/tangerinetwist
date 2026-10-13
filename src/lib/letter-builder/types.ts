// The letter builder: a customer spells a word from individually printed pieces (A–Z, 0–9,
// ♥) and picks a style and colour per piece. These types are shared by the builder UI and,
// later, the server (pricing/validation) and the order snapshot, so they stay plain data.

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
  basePrice: number; // rupees: ring/clicker body
}

export interface BuilderPreset {
  id: string;
  label: string;
  // Colour ids cycled across the word, e.g. rainbow. One entry = every piece that colour.
  colors: string[];
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
  color: string;
}

export interface Design {
  format: BuilderFormatId;
  pieces: DesignPiece[];
}
