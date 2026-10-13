// The server-rendered thumbnail of a design: a plain-markup (flexbox + inline styles)
// drawing that Satori — what next/og's ImageResponse renders with — can turn into a PNG.
// Deliberately free of Next imports so the same file runs anywhere (it's tested in a Linux
// container, since next/og can't run on Windows). The fonts it names must be supplied to
// the renderer by the caller.
import * as React from "react";
import { HEART, colorHex } from "./design";
import { shade } from "./color";
import type { BuilderConfig, Design, DesignPiece } from "./types";

export const THUMB_SIZE = 480;

export const FONT_NAME: Record<string, string> = { lilita: "Lilita One", archivo: "Archivo Black", chewy: "Chewy" };

const HEART_PATH = "M16 29 C 6 21, 0 15, 0 9 A 8 8 0 0 1 16 6 A 8 8 0 0 1 32 9 C 32 15, 26 21, 16 29 Z";

function Glyph({ piece, config, px }: { piece: DesignPiece; config: BuilderConfig; px: number }) {
  const ink = colorHex(config, piece.ink);
  if (piece.char === HEART) {
    return (
      <svg width={px * 0.95} height={px * 0.9} viewBox="0 0 32 30">
        <path d={HEART_PATH} fill={ink} />
      </svg>
    );
  }
  const font = FONT_NAME[config.styles.find((s) => s.id === piece.style)?.font ?? "lilita"] ?? "Lilita One";
  return (
    <div style={{ display: "flex", fontFamily: font, fontSize: px, color: ink, lineHeight: 1, textShadow: `0 ${px * 0.05}px 0 ${shade(colorHex(config, piece.body), -0.3)}` }}>
      {piece.char}
    </div>
  );
}

export function DesignThumbnail({ design, config }: { design: Design; config: BuilderConfig }) {
  const n = design.pieces.length;
  const trim = colorHex(config, design.trim);
  const isKey = design.format === "clicker";
  const gap = isKey ? 8 : 4;
  // Room for the pieces: a keychain also needs its two knots and cord stubs inside the frame;
  // a clicker its frame padding. Either way a margin so nothing touches the edge.
  const avail = isKey ? THUMB_SIZE - 28 - 28 : THUMB_SIZE - 2 * (38 + 14) - 36;
  const w = Math.min(isKey ? 100 : 96, Math.floor((avail - (n - 1) * gap) / n));
  const h = isKey ? w : Math.round(w * 1.16);

  const pieces = design.pieces.map((piece, i) => {
    const body = colorHex(config, piece.body);
    return (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: w,
          height: h,
          borderRadius: isKey ? w * 0.18 : w * 0.3,
          backgroundColor: body,
          boxShadow: `0 ${w * 0.07}px 0 ${shade(body, -0.26)}`,
        }}
      >
        <Glyph piece={piece} config={config} px={w * (isKey ? 0.54 : 0.66)} />
      </div>
    );
  });

  if (isKey) {
    const pad = 14;
    return (
      <div style={{ display: "flex", padding: pad, borderRadius: 26, backgroundColor: trim, boxShadow: `0 8px 0 ${shade(trim, -0.22)}`, gap }}>
        {pieces}
      </div>
    );
  }
  const knot = { display: "flex", width: 38, height: 38, borderRadius: 19, backgroundColor: trim, border: `4px solid ${shade(trim, -0.22)}` } as const;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={knot} />
      <div style={{ display: "flex", height: 20, width: 14, backgroundColor: trim }} />
      <div style={{ display: "flex", gap }}>{pieces}</div>
      <div style={{ display: "flex", height: 20, width: 14, backgroundColor: trim }} />
      <div style={knot} />
    </div>
  );
}

