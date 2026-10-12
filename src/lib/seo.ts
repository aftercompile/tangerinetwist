import { Metadata } from "next";

export const siteConfig = {
  name: "TangerineTwist",
  // The apex domain 308-redirects here, so this must be the final resolved
  // URL — every canonical tag, OG url, and JSON-LD url is built from this.
  url: "https://www.tangerinetwist.in",
  description:
    "TangerineTwist is a modern design studio crafting premium 3D-printed home décor and workspace essentials — designer lamps, decorative idols and desk organizers, made in India.",
  keywords: [
    "3D Printed Lamps",
    "Designer Lamps",
    "Decorative Idols",
    "Resin Idols",
    "8K Resin Printing",
    "PLA Home Décor",
    "Desk Organizers",
    "Workspace Accessories",
    "Modern Home Décor",
    "Luxury Home Accessories",
    "Contemporary Desk Setup",
    "Minimal Desk Accessories",
  ],
  social: {
    instagram: "https://www.instagram.com/tangerinetwist.studio",
  },
};

// Shared social-share card. Declared explicitly because a page that sets its own
// `openGraph` (as buildMetadata does) replaces any file-based opengraph-image
// inherited from the root layout, so the card would silently go missing.
export const ogImage = {
  url: "/brand/og-image.png",
  width: 1200,
  height: 630,
  alt: "TangerineTwist Studio — Premium 3D-Printed Home Décor & Workspace Essentials",
};

export function buildMetadata({
  title,
  description,
  path = "",
  keywords,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  return {
    title,
    description,
    keywords: keywords ?? siteConfig.keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_IN",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
