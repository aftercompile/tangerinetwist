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
    heroStatement: "Designed to feel like furniture that happens to glow.",
    storyTitle: "The Craft Behind Every Glow",
    storyBody:
      "Every lamp starts as a study in shadow, not light — we sketch how a form will look switched off before we ever model how it glows. Each shell is printed in fine-layer premium PLA, then hand-sanded to soften every edge before a warm-white 2700K LED module is fitted. The result is diffused, flicker-free light shaped by form, inspired by dunes, moons and courtyard arches rather than catalogue fixtures.",
    storyImage: "/images/story/story-lamps.jpg",
    journeySteps: ["Concept", "Digital Sculpt", "Fine-Layer PLA Printing", "Hand Sanded & Finished", "Quality Checked", "Delivered"],
    stats: [
      { label: "Fine-Layer PLA", icon: "Layers" },
      { label: "Hand Finished", icon: "Hand" },
      { label: "Ships in 48 Hours", icon: "Truck" },
      { label: "Designed in India", icon: "MapPin" },
    ],
    lifestyleImage: "/images/lifestyle/lifestyle-lamps.jpg",
    lifestyleHeadline: "Bring calm into every corner.",
    lifestyleBody:
      "A single considered light can change how a room feels at the end of the day. Crafted to become part of your evening rituals — not just switched on, but lived with.",
    closingImage: "/images/collections/collections-lamps.jpg",
    closingHeadline: "Crafted for homes that appreciate design.",
    closingBody:
      "Every TangerineTwist lamp starts as a sketch and ends as something you'll reach for every night. Explore the full collection and find the light that fits your room.",
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
    heroStatement: "Designed to become timeless objects within modern interiors.",
    storyTitle: "8K Precision, Finished by Hand",
    storyBody:
      "Traditional moulding struggles to hold fine texture — the fold of a fabric, the edge of a crown, the quiet expression on a resting face. 8K resin printing resolves all of it, and every idol is then hand-finished by our studio artisans with a matte-satin surface before it's checked and packed. It's traditional sculpture, reimagined through modern manufacturing without losing the handmade character that makes each piece worth keeping.",
    storyImage: "/images/story/story-idols.jpg",
    journeySteps: ["Concept", "Digital Sculpt", "8K Resin Printing", "Hand Finished", "Quality Checked", "Delivered"],
    stats: [
      { label: "8K Resin Detail", icon: "Sparkles" },
      { label: "Hand Finished", icon: "Hand" },
      { label: "Lightweight & Durable", icon: "Feather" },
      { label: "Ships in 48 Hours", icon: "Truck" },
    ],
    lifestyleImage: "/images/lifestyle/lifestyle-idols.jpg",
    lifestyleHeadline: "A quiet presence in every room.",
    lifestyleBody:
      "Each idol is designed to sit with intention — on an entryway console, a pooja shelf, or a meditation corner. Not mass ornament, but a considered object you chose.",
    closingImage: "/images/collections/collections-idols.jpg",
    closingHeadline: "Crafted for spaces that hold meaning.",
    closingBody:
      "From concept to hand-finished detail, every idol carries the same care as pieces sculpted the traditional way — just made accessible. Explore the full collection.",
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
    heroStatement: "A calmer desk is a clearer mind.",
    storyTitle: "Considered Objects for Real Desks",
    storyBody:
      "Every piece in this collection started with an audit of our own messiest desks — every compartment size, every angle, chosen from what actually accumulates on a work-from-home setup, not a generic office supply list. Each accessory is precision printed in premium PLA, finished with silicone grip details where it matters, and hand inspected before it ships, so it holds up to daily use rather than just looking good in a photo.",
    storyImage: "/images/story/story-desk-organizers.jpg",
    journeySteps: ["Concept", "Digital Design", "Precision PLA Printing", "Hand Inspected", "Quality Checked", "Delivered"],
    stats: [
      { label: "Precision PLA", icon: "Layers" },
      { label: "Modular System", icon: "LayoutGrid" },
      { label: "Hand Inspected", icon: "Sparkles" },
      { label: "Ships in 48 Hours", icon: "Truck" },
    ],
    lifestyleImage: "/images/lifestyle/lifestyle-desk-organizers.jpg",
    lifestyleHeadline: "Design that disappears into your day.",
    lifestyleBody:
      "The best desk accessories are the ones you stop noticing — because everything already has its place. Built for creators, gamers, and anyone who works from a desk they actually like looking at.",
    closingImage: "/images/collections/collections-desk-organizers.jpg",
    closingHeadline: "Crafted for desks that mean business.",
    closingBody: "Mix, match, and build a desk system that actually fits how you work. Explore the full collection.",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
