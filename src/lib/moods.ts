// Curated cross-category "Shop by Mood" collections — not DB-driven, since
// these are editorial concepts the studio defines once, not per-category
// content. Each mood maps to a filter-chip id in the same "type:value" shape
// CategoryExplorer computes for its real facets (see computeChips there), so
// clicking a mood pre-applies a real filter instead of just being decorative.
export interface Mood {
  slug: string;
  label: string;
  description: string;
  image: string;
  chipId: string;
}

export const moods: Mood[] = [
  {
    slug: "minimal-living",
    label: "Minimal Living",
    description: "Quiet forms, considered space.",
    image: "/images/moods/minimal-living.jpg",
    chipId: "style:minimal",
  },
  {
    slug: "zen-spaces",
    label: "Zen Spaces",
    description: "Stillness you can place on a shelf.",
    image: "/images/moods/zen-spaces.jpg",
    chipId: "style:minimal",
  },
  {
    slug: "modern-workspace",
    label: "Modern Workspace",
    description: "Considered tools for focused work.",
    image: "/images/moods/modern-workspace.jpg",
    chipId: "style:modern",
  },
  {
    slug: "luxury-home",
    label: "Luxury Home",
    description: "Objects that feel collected, not bought.",
    image: "/images/moods/luxury-home.jpg",
    chipId: "style:luxury",
  },
  {
    slug: "meditation-corner",
    label: "Meditation Corner",
    description: "A small space set aside for stillness.",
    image: "/images/moods/meditation-corner.jpg",
    chipId: "style:minimal",
  },
  {
    slug: "warm-interiors",
    label: "Warm Interiors",
    description: "Soft light, natural tones, no hard edges.",
    image: "/images/moods/warm-interiors.jpg",
    chipId: "color:white",
  },
];
