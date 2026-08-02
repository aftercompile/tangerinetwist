import { ImageResponse } from "next/og";

// PNG fallback alongside the existing public/favicon.svg (still referenced
// via metadata.icons in layout.tsx for browsers that prefer SVG) — some
// browsers, crawlers, and bookmark/share surfaces don't resolve SVG favicons
// and silently show nothing without this. Mirrors favicon.svg's design
// exactly (charcoal circle, tangerine dot) rather than inventing a new mark.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: "#1B1815",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#E86A2C", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
