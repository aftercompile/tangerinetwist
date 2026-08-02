import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

// Next's file-based convention: this alone makes every page that doesn't
// define its own opengraph-image/twitter-image get this as its social-share
// card — no manual `images` field needed in buildMetadata(). System font
// stack rather than fetching Manrope at request time, so this can never fail
// metadata generation over a flaky font fetch.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1B1815",
          backgroundImage: "radial-gradient(circle at 25% 20%, #E86A2C33 0%, transparent 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#E86A2C", display: "flex" }} />
          <span style={{ fontSize: 64, fontWeight: 700, color: "#FBF8F3", letterSpacing: -1 }}>
            {siteConfig.name}
          </span>
        </div>
        <span style={{ marginTop: 24, fontSize: 30, color: "#FBF8F3B3", maxWidth: 820, textAlign: "center" }}>
          Premium 3D-Printed Home Décor &amp; Workspace Essentials
        </span>
      </div>
    ),
    { ...size }
  );
}
