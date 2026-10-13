import { siteConfig } from "@/lib/seo";
import type { Design } from "./types";

/**
 * Public URL of a design's thumbnail PNG (served by /api/design-image). The design is the
 * URL, so the image is immutable and can be cached forever; the route re-validates what it
 * is handed. Server-side only (uses Buffer) — for payment providers and emails, which need a
 * real image link rather than the browser-drawn SVG.
 */
export function designImageUrl(productSlug: string, design: Design): string {
  const d = Buffer.from(JSON.stringify(design)).toString("base64url");
  return `${siteConfig.url}/api/design-image?p=${encodeURIComponent(productSlug)}&d=${d}`;
}
