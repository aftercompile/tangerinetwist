import type { BuilderConfig } from "./types";

// Prototype config. Moves to the product's admin-editable settings once orders are wired
// up — prices here are placeholders until real ones are set.
export const DEMO_BUILDER_CONFIG: BuilderConfig = {
  styles: [
    { id: "rounded", label: "Rounded", font: "lilita" },
    { id: "block", label: "Block", font: "archivo" },
    { id: "playful", label: "Playful", font: "chewy" },
  ],
  colors: [
    { id: "pink", label: "Sakura Pink", hex: "#F4A6B7", available: true },
    { id: "tangerine", label: "Tangerine", hex: "#E86A2C", available: true },
    { id: "sunflower", label: "Sunflower", hex: "#F2C14E", available: true },
    { id: "mint", label: "Mint", hex: "#8FD694", available: true },
    { id: "teal", label: "Teal", hex: "#45B7B0", available: true },
    { id: "sky", label: "Sky Blue", hex: "#5AA9F2", available: true },
    { id: "lavender", label: "Lavender", hex: "#9B8CF7", available: true },
    { id: "charcoal", label: "Charcoal", hex: "#2B2622", available: true },
  ],
  formats: [
    { id: "keychain", label: "Keychain", blurb: "Letters on a metal ring", basePrice: 149 },
    { id: "clicker", label: "Clicker", blurb: "Clicky keys you can press", basePrice: 249 },
  ],
  presets: [
    { id: "rainbow", label: "Rainbow", colors: ["pink", "tangerine", "sunflower", "mint", "teal", "sky", "lavender"] },
    { id: "pastel", label: "Pastel", colors: ["pink", "lavender", "mint", "sky", "sunflower"] },
    { id: "sunset", label: "Sunset", colors: ["tangerine", "pink", "sunflower"] },
    { id: "ocean", label: "Ocean", colors: ["teal", "sky", "mint"] },
    { id: "mono", label: "Mono", colors: ["charcoal"] },
  ],
  perPiecePrice: 40,
  maxPieces: 10,
};
