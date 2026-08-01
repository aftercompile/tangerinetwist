import * as THREE from "three";

/**
 * Procedural geometry for the hero lamp.
 *
 * There is no .glb in this repo and no way to author one, so the lamp is modelled
 * in code. That's not a workaround — the hero animation assembles the lamp part by
 * part, and a single imported mesh would have to be split into named sub-meshes
 * anyway. Building it here makes every part separately animatable by construction,
 * costs no network bytes, and lets the palette come straight from the design tokens.
 *
 * Pure module: no React, no hooks, no side effects at import time. Everything is a
 * factory the caller owns and must dispose (see LampParts' cleanup).
 *
 * Units: 1 unit ~= 10cm. Y is measured from the print bed at y=0, so every number
 * below reads as "height above the bed" and LAMP_LAYOUT is the single source of
 * truth shared with choreography.ts — if a part moves, it moves in one place.
 */

/** Every Y offset in the scene, so geometry and choreography can never drift apart. */
export const LAMP_LAYOUT = {
  bedY: 0,
  gridY: 0.002,
  contactShadowY: 0.004,
  baseY: 0,
  /** Base profile ends here; the column's lower collar sits on it. */
  baseTop: 0.58,
  lowerCollarY: 0.61,
  columnY: 1.255,
  upperCollarY: 1.9,
  socketY: 2.05,
  /** Shade rim — the widest point of the silhouette. */
  shadeY: 2.1,
  bulbY: 2.42,
  /** Shade profile is 1.15 tall, so its open top lands here. */
  shadeTop: 3.25,
  finialStubY: 3.22,
  finialCapY: 3.3,
  /** Lifts the whole lamp so its optical centre sits at the world origin. */
  groupY: -1.62,
} as const;

/**
 * Shade profile as [radius, y] pairs — a bell that flares at the rim and tapers to
 * an open top. Deliberately not capped at either end: the shade is a hollow shell,
 * which is what lets the print-wipe in choreography.ts expose a real wall thickness
 * at the clipped edge instead of a flat disc.
 */
export const SHADE_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.98, 0.0],
  [0.99, 0.06],
  [0.995, 0.16],
  [0.99, 0.3],
  [0.965, 0.44],
  [0.925, 0.58],
  [0.87, 0.71],
  [0.8, 0.82],
  [0.71, 0.92],
  [0.6, 1.0],
  [0.48, 1.06],
  [0.36, 1.1],
  [0.24, 1.13],
  [0.16, 1.15],
];

/**
 * Base profile. Starts at radius 0 so the lathe closes into a solid cap — unlike
 * the shade, you should never be able to see up inside the base.
 */
export const BASE_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.0],
  [1.05, 0.0],
  [1.08, 0.03],
  [1.06, 0.1],
  [0.98, 0.2],
  [0.86, 0.3],
  [0.74, 0.38],
  [0.62, 0.44],
  [0.52, 0.5],
  [0.46, 0.55],
  [0.44, 0.58],
];

/** Rib count shared by shade and base so the two visually rhyme. */
export const RIBS = 24;

/**
 * Push the lathe's vertices in and out radially to cut vertical flutes.
 *
 * Modulating the position buffer rather than instancing rib meshes keeps this to a
 * single draw call *and* gives a real fluted silhouette — instanced boxes stuck to
 * a smooth cone would read as smooth the moment you look at its edge.
 *
 * `fadeFrom`/`fadeTo` taper the flute amplitude to zero over a Y range so the ribs
 * die out before the shade's narrow top, where they'd otherwise self-intersect.
 */
export function applyFlutes(
  geometry: THREE.BufferGeometry,
  ribs: number,
  amplitude: number,
  fadeFrom: number,
  fadeTo: number
): THREE.BufferGeometry {
  const pos = geometry.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const radius = Math.hypot(x, z);
    // Vertices on the axis have no angle to modulate — leave the cap alone.
    if (radius < 1e-4) continue;

    const theta = Math.atan2(z, x);
    const fade = 1 - THREE.MathUtils.smoothstep(y, fadeFrom, fadeTo);
    const scale = 1 + amplitude * fade * Math.cos(ribs * theta);

    pos.setXYZ(i, x * scale, y, z * scale);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();

  // Note: LatheGeometry duplicates its seam vertices at theta=0/2pi, so the normals
  // there stay split. We deliberately don't run mergeVertices to fix it — the flute
  // already puts a hard crease every 360/24 degrees, so one more at the seam is
  // invisible, and importing BufferGeometryUtils from three/examples/jsm is the one
  // thing likely to force a transpilePackages entry in next.config.mjs.
  return geometry;
}

function toVector2s(profile: ReadonlyArray<readonly [number, number]>): THREE.Vector2[] {
  return profile.map(([radius, y]) => new THREE.Vector2(radius, y));
}

/** Fluted shade shell. `segments` drops on low-power devices — see LampCanvas. */
export function buildShadeGeometry(segments = 192): THREE.BufferGeometry {
  const geometry = new THREE.LatheGeometry(toVector2s(SHADE_PROFILE), segments, 0, Math.PI * 2);
  return applyFlutes(geometry, RIBS, 0.035, 1.02, 1.15);
}

/** Solid base. Half the shade's flute amplitude so it reads as the same family, quieter. */
export function buildBaseGeometry(segments = 96): THREE.BufferGeometry {
  const geometry = new THREE.LatheGeometry(toVector2s(BASE_PROFILE), segments, 0, Math.PI * 2);
  return applyFlutes(geometry, RIBS, 0.018, 0.5, 0.58);
}

/**
 * Radius of the shade at a given height, by linear interpolation of the profile.
 * The print-head ring rides the clip plane during the shade wipe and has to hug the
 * silhouette as it climbs, which means reading the same curve the lathe was built from.
 */
export function shadeRadiusAt(y: number): number {
  const first = SHADE_PROFILE[0];
  const last = SHADE_PROFILE[SHADE_PROFILE.length - 1];
  if (y <= first[1]) return first[0];
  if (y >= last[1]) return last[0];

  for (let i = 0; i < SHADE_PROFILE.length - 1; i += 1) {
    const [r0, y0] = SHADE_PROFILE[i];
    const [r1, y1] = SHADE_PROFILE[i + 1];
    if (y >= y0 && y <= y1) {
      const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
      return r0 + (r1 - r0) * t;
    }
  }
  return last[0];
}

/** Guard so texture factories can't be called during SSR by accident. */
function createCanvas(size: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * Faint printer-bed grid. Generated rather than shipped as a PNG — it's a dozen
 * lines, and an asset request for that would cost more than drawing it.
 */
export function makeGridTexture(): THREE.CanvasTexture | null {
  const canvas = createCanvas(512);
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return null;

  ctx.clearRect(0, 0, 512, 512);
  ctx.strokeStyle = "#E4D8C3";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i + 0.5, 0);
    ctx.lineTo(i + 0.5, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i + 0.5);
    ctx.lineTo(512, i + 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * White-centre radial falloff, used twice: as the contact shadow's alphaMap and as
 * the additive glow quad's map. Doing both from one generator keeps the bloom and
 * the shadow visually consistent, and replaces both drei's <ContactShadows> and a
 * full postprocessing bloom pass.
 */
export function makeRadialTexture(stop = 0.7): THREE.CanvasTexture | null {
  const canvas = createCanvas(256);
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return null;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(stop, "rgba(255,255,255,0.22)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}
