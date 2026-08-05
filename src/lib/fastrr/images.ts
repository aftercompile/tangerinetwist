import { siteConfig } from "@/lib/seo";

const SUPABASE_OBJECT_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

// Fastrr's checkout renders line-item thumbnails in a fixed square box and stretches
// whatever it's given to fill it — our product photos are portrait (e.g. 1436x2000,
// ratio 0.72), so they came out visibly squashed. Supabase Storage exposes an
// on-the-fly transform endpoint (verified working on this project: the same object
// returned a true 400x400 center-crop at ~7% of the original file size), so we hand
// Fastrr a pre-squared URL instead of asking their UI to letterbox for us.
//
// Non-Supabase sources (site-relative seed paths under /public) can't be transformed
// this way and are just returned absolute — they'll still render, only uncropped.
export function toFastrrImageUrl(src: string, size = 400): string {
  const absolute = src.startsWith("/") ? `${siteConfig.url}${src}` : src;
  if (!absolute.includes(SUPABASE_OBJECT_PATH)) return absolute;

  const rendered = absolute.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
  const separator = rendered.includes("?") ? "&" : "?";
  return `${rendered}${separator}width=${size}&height=${size}&resize=cover`;
}
