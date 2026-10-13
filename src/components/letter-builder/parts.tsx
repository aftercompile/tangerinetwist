// SVG drawing kit for the letter pieces and everything they hang on. One kit is shared by
// the hero choreography, the scroll story and the builder preview, so the animation, the
// preview and the printed piece never drift apart. All parts draw centred on (0, 0) in a
// unit where a letter bead is 100 wide.
import * as React from "react";
import type { BuilderConfig, DesignPiece } from "@/lib/letter-builder/types";
import { HEART, colorHex } from "@/lib/letter-builder/design";
import { shade } from "@/lib/letter-builder/color";
import { BUILDER_FONTS } from "./fonts";

export const BEAD = { w: 100, h: 116, rx: 30, gap: 4 } as const;
export const KEY = { size: 100, gap: 10, pad: 16 } as const;
export const ACCENT_R = 30;

export { shade } from "@/lib/letter-builder/color";

const HEART_PATH = "M0 26 C -18 12, -30 2, -30 -10 A 15 15 0 0 1 0 -18 A 15 15 0 0 1 30 -10 C 30 2, 18 12, 0 26 Z";

/** The raised letter (or heart) on a piece, with a soft shadow onto the body. */
function Glyph({ piece, config, size, body }: { piece: DesignPiece; config: BuilderConfig; size: number; body: string }) {
  const ink = colorHex(config, piece.ink);
  const outline = shade(ink, -0.12);
  const drop = shade(body, -0.32);
  if (piece.char === HEART) {
    const s = size / 76;
    return (
      <g transform={`scale(${s})`}>
        <path d={HEART_PATH} transform="translate(0 4)" fill={drop} opacity={0.55} />
        <path d={HEART_PATH} fill={ink} stroke={outline} strokeWidth={2} />
      </g>
    );
  }
  const fontFamily = BUILDER_FONTS[config.styles.find((s) => s.id === piece.style)?.font ?? "lilita"];
  const common = { x: 0, textAnchor: "middle" as const, dominantBaseline: "central" as const, fontSize: size, style: { fontFamily } };
  return (
    <>
      <text {...common} y={4} fill={drop} opacity={0.55}>
        {piece.char}
      </text>
      <text {...common} y={0} fill={ink} stroke={outline} strokeWidth={2} paintOrder="stroke">
        {piece.char}
      </text>
    </>
  );
}

/** A chunky rounded letter bead (the bead keychain). */
export function BeadShape({ piece, config }: { piece: DesignPiece; config: BuilderConfig }) {
  const body = colorHex(config, piece.body);
  const { w, h, rx } = BEAD;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2 + 8} width={w} height={h} rx={rx} fill={shade(body, -0.24)} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={rx} fill={body} />
      <rect x={-w / 2 + 10} y={-h / 2 + 7} width={w - 20} height={h * 0.42} rx={rx - 10} fill="#FFFFFF" opacity={0.22} />
      <Glyph piece={piece} config={config} size={74} body={body} />
    </g>
  );
}

/** A keycap with a lighter top face (the keycap clicker). */
export function KeycapShape({ piece, config }: { piece: DesignPiece; config: BuilderConfig }) {
  const body = colorHex(config, piece.body);
  const s = KEY.size;
  return (
    <g>
      <rect x={-s / 2} y={-s / 2 + 6} width={s} height={s} rx={18} fill={shade(body, -0.26)} />
      <rect x={-s / 2} y={-s / 2} width={s} height={s - 4} rx={18} fill={body} />
      <rect x={-s / 2 + 12} y={-s / 2 + 9} width={s - 24} height={s - 34} rx={13} fill={shade(body, 0.16)} />
      <g transform="translate(0 -8)">
        <Glyph piece={piece} config={config} size={54} body={body} />
      </g>
    </g>
  );
}

/** A round accent bead with a glossy highlight. */
export function AccentBead({ hex, r = ACCENT_R }: { hex: string; r?: number }) {
  return (
    <g>
      <circle r={r} cy={4} fill={shade(hex, -0.25)} />
      <circle r={r} fill={hex} />
      <ellipse cx={-r * 0.32} cy={-r * 0.38} rx={r * 0.32} ry={r * 0.2} fill="#FFFFFF" opacity={0.55} />
    </g>
  );
}

/** A cord knot — a little cluster of loops. */
export function Knot({ hex, scale = 1 }: { hex: string; scale?: number }) {
  const dark = shade(hex, -0.22);
  return (
    <g transform={`scale(${scale})`}>
      {[
        [-10, -10],
        [10, -8],
        [0, 8],
        [-12, 10],
        [12, 10],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={15} fill={hex} stroke={dark} strokeWidth={3} />
      ))}
    </g>
  );
}

/** Paracord: a thick rope with a woven highlight along it. */
export function Rope({ d, hex, pathLength }: { d: string; hex: string; pathLength?: React.ComponentProps<"path">["pathLength"] }) {
  return (
    <g>
      <path d={d} fill="none" stroke={shade(hex, -0.22)} strokeWidth={26} strokeLinecap="round" pathLength={pathLength} />
      <path d={d} fill="none" stroke={hex} strokeWidth={20} strokeLinecap="round" pathLength={pathLength} />
      <path d={d} fill="none" stroke={shade(hex, 0.45)} strokeWidth={6} strokeLinecap="round" strokeDasharray="5 13" opacity={0.8} pathLength={pathLength} />
    </g>
  );
}

function starPath(outer: number, inner: number): string {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  });
  return `M ${pts.join(" L ")} Z`;
}
const STAR = starPath(58, 28);

/** The hollow star clip from the reference, plus the small ring joining it to the cord. */
export function StarClip({ hex }: { hex: string }) {
  return (
    <g>
      <path d={STAR} transform="translate(0 5)" fill="none" stroke={shade(hex, -0.25)} strokeWidth={22} strokeLinejoin="round" />
      <path d={STAR} fill="none" stroke={hex} strokeWidth={22} strokeLinejoin="round" />
      <path d={STAR} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinejoin="round" opacity={0.45} transform="translate(-3 -3)" />
    </g>
  );
}

export function SplitRing() {
  return <circle r={17} fill="none" stroke="#E9E4EE" strokeWidth={7} />;
}

// ─── Layouts ────────────────────────────────────────────────────────────────────────────

export interface BeadLayout {
  slots: number[]; // letter bead centres (x), all at y = 0
  lettersWidth: number;
  ropeMain: string;
  ropeToClip: string;
  ring: { x: number; y: number };
  clip: { x: number; y: number };
  leftKnot: number;
  accents: number[];
  rightKnot: number;
  tail: string;
  tailKnot: { x: number; y: number };
  viewBox: [number, number, number, number];
}

/** Bead keychain: clip → cord → knot → letter beads → two accent beads → knot → tail. */
export function beadLayout(n: number): BeadLayout {
  const count = Math.max(n, 1);
  const slots = Array.from({ length: count }, (_, i) => i * (BEAD.w + BEAD.gap) + BEAD.w / 2);
  const lettersWidth = count * BEAD.w + (count - 1) * BEAD.gap;
  const leftKnot = -42;
  const ring = { x: -150, y: -110 };
  const clip = { x: -192, y: -176 };
  const a1 = lettersWidth + 38;
  const a2 = a1 + ACCENT_R * 2 + 4;
  const rightKnot = a2 + 58;
  const tailKnot = { x: rightKnot + 32, y: 150 };
  return {
    slots,
    lettersWidth,
    ropeMain: `M ${leftKnot} 0 L ${rightKnot} 0`,
    ropeToClip: `M ${leftKnot} 0 C ${leftKnot - 50} 0, ${ring.x + 25} ${ring.y + 60}, ${ring.x} ${ring.y}`,
    ring,
    clip,
    leftKnot,
    accents: [a1, a2],
    rightKnot,
    tail: `M ${rightKnot} 0 C ${rightKnot + 40} 10, ${rightKnot + 52} 70, ${tailKnot.x} ${tailKnot.y - 18}`,
    tailKnot,
    viewBox: [-265, -250, rightKnot + 110 + 265, 430],
  };
}

export interface KeyLayout {
  slots: number[];
  lettersWidth: number;
  frame: { x: number; y: number; w: number; h: number };
  tab: { x: number; y: number; w: number; h: number; hole: { x: number; y: number } };
  viewBox: [number, number, number, number];
}

/** Keycap clicker: a frame with a keyring tab, keys sitting in a row. */
export function keyLayout(n: number): KeyLayout {
  const count = Math.max(n, 1);
  const slots = Array.from({ length: count }, (_, i) => i * (KEY.size + KEY.gap) + KEY.size / 2);
  const lettersWidth = count * KEY.size + (count - 1) * KEY.gap;
  const frame = { x: -KEY.pad, y: -KEY.size / 2 - KEY.pad + 2, w: lettersWidth + KEY.pad * 2, h: KEY.size + KEY.pad * 2 + 4 };
  const tab = { x: frame.x - 74, y: -40, w: 104, h: 80, hole: { x: frame.x - 36, y: 0 } };
  return { slots, lettersWidth, frame, tab, viewBox: [tab.x - 20, -100, frame.w + 74 + 20 + 30, 210] };
}

/** The clicker body: frame, keyring tab and a slot under each key. */
export function KeyFrame({ layout, hex }: { layout: KeyLayout; hex: string }) {
  const { frame, tab } = layout;
  const dark = shade(hex, -0.22);
  return (
    <g>
      <rect x={tab.x} y={tab.y + 8} width={tab.w} height={tab.h} rx={36} fill={dark} />
      <rect x={tab.x} y={tab.y} width={tab.w} height={tab.h} rx={36} fill={hex} />
      <circle cx={tab.hole.x} cy={tab.hole.y} r={15} fill="#FBF8F3" stroke={dark} strokeWidth={4} />
      <rect x={frame.x} y={frame.y + 10} width={frame.w} height={frame.h} rx={26} fill={dark} />
      <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx={26} fill={hex} />
      <rect x={frame.x + 6} y={frame.y + 6} width={frame.w - 12} height={frame.h * 0.35} rx={20} fill="#FFFFFF" opacity={0.2} />
      {layout.slots.map((x) => (
        <rect key={x} x={x - KEY.size / 2 - 3} y={-KEY.size / 2 - 1} width={KEY.size + 6} height={KEY.size + 8} rx={20} fill={shade(hex, -0.3)} />
      ))}
    </g>
  );
}
