import type { BuilderConfig } from "./types";

// Prototype config. Moves to the product's admin-editable settings once orders are wired
// up — prices and colours here are placeholders until real ones are set.
export const DEMO_BUILDER_CONFIG: BuilderConfig = {
  styles: [
    { id: "rounded", label: "Rounded", font: "lilita" },
    { id: "block", label: "Block", font: "archivo" },
    { id: "playful", label: "Playful", font: "chewy" },
  ],
  colors: [
    { id: "white", label: "Cloud White", hex: "#FFFDF8", available: true },
    { id: "pink", label: "Bubblegum", hex: "#F7B2C6", available: true },
    { id: "peach", label: "Peach", hex: "#FBC6A4", available: true },
    { id: "butter", label: "Butter", hex: "#F7DE8C", available: true },
    { id: "mint", label: "Mint", hex: "#A6E3C2", available: true },
    { id: "aqua", label: "Aqua", hex: "#76CFD6", available: true },
    { id: "sky", label: "Sky", hex: "#9CC6F2", available: true },
    { id: "lilac", label: "Lilac", hex: "#C3B0F0", available: true },
    { id: "tangerine", label: "Tangerine", hex: "#F28A4B", available: true },
    { id: "charcoal", label: "Charcoal", hex: "#2E2925", available: true },
  ],
  formats: [
    { id: "keychain", label: "Bead keychain", blurb: "Letter beads on a soft cord", trimLabel: "Cord", basePrice: 149 },
    { id: "clicker", label: "Keycap clicker", blurb: "Keys you can press, in a frame", trimLabel: "Frame", basePrice: 249 },
  ],
  presets: [
    { id: "pastel", label: "Pastel", bodies: ["pink", "lilac", "mint", "sky", "butter", "peach"], ink: "white", trim: "pink" },
    { id: "candy", label: "Candy", bodies: ["aqua"], ink: "pink", trim: "sky" },
    { id: "sorbet", label: "Sorbet", bodies: ["peach", "pink", "butter"], ink: "white", trim: "peach" },
    { id: "ocean", label: "Ocean", bodies: ["aqua", "sky", "mint"], ink: "white", trim: "aqua" },
    { id: "cloud", label: "Cloud", bodies: ["white"], ink: "lilac", trim: "lilac" },
    { id: "midnight", label: "Midnight", bodies: ["charcoal"], ink: "butter", trim: "charcoal" },
  ],
  perPiecePrice: 40,
  maxPieces: 10,
};
