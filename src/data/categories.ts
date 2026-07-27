import { CategoryMeta } from "@/lib/types";

export const categories: CategoryMeta[] = [
  {
    slug: "lamps",
    name: "Designer Lamps",
    shortName: "Lamps",
    tagline: "Sculptural light for everyday rituals",
    description:
      "Each lamp is printed in fine-layer premium PLA, then hand-finished to soften every edge. Warm, diffused light shaped by form — designed to make ordinary corners feel considered.",
    heroIcon: "lamp",
    priceRange: "₹1,299 – ₹1,799",
    material: "Premium PLA, warm-white LED",
  },
  {
    slug: "idols",
    name: "Decorative Idols",
    shortName: "Idols",
    tagline: "Devotion, rendered in extraordinary detail",
    description:
      "Cast in ultra-high-detail 8K resin printing and hand-finished by our studio artisans, each idol carries a level of texture and expression that traditional moulding can't reach — lightweight, durable, and quietly luminous.",
    heroIcon: "sparkles",
    priceRange: "₹1,199 – ₹1,799",
    material: "8K Resin, hand-finished",
  },
  {
    slug: "desk-organizers",
    name: "Desk Organizers",
    shortName: "Desk",
    tagline: "A calmer, more considered desk",
    description:
      "Modular, precision-printed accessories for the modern workspace — built for creators, gamers, and anyone who works from a desk they actually like looking at.",
    heroIcon: "layout-grid",
    priceRange: "₹399 – ₹999",
    material: "Premium PLA / Silicone details",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
