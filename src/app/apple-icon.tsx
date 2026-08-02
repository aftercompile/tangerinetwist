import { ImageResponse } from "next/og";

// iOS applies its own rounded-square mask on home-screen icons, so unlike
// icon.tsx this fills a solid square rather than relying on a transparent
// circle — a circular PNG on a transparent background looks broken once iOS
// crops it.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#1B1815",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 68, height: 68, borderRadius: "50%", backgroundColor: "#E86A2C", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
