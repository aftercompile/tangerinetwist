import { Metadata } from "next";

export const siteConfig = {
  name: "TangerineTwist",
  url: "https://tangerinetwist.com",
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
