import * as THREE from "three";
import { cubicBezier } from "framer-motion";
import { EASE_PREMIUM, EASE_OUT } from "@/lib/motion";
import { LAMP_LAYOUT, shadeRadiusAt } from "./lamp-geometry";

/**
 * The assembly timeline, as data.
 *
 * `applyChoreography` is a *pure function of progress* — given p it sets the scene to
 * exactly one state, with no memory of how it got there. That's what makes the
 * animation scrub backwards correctly when the user scrolls up. Anything implemented
 * as a one-shot effect ("when p crosses 0.5, play X") would strand parts mid-air on
 * the way back, so nothing here is allowed to be stateful.
 *
 * Curves come from @/lib/motion rather than being inlined, so the lamp moves on the
 * same rhythm as the rest of the site.
 */

export const easePremium = cubicBezier(...EASE_PREMIUM);
export const easeOut = cubicBezier(...EASE_OUT);

/** Normalized, clamped, eased progress of one part within its [start, end] window. */
export function win(p: number, a: number, b: number, ease: (t: number) => number = easePremium) {
  return ease(THREE.MathUtils.clamp((p - a) / (b - a), 0, 1));
}

/** Same, without easing — for anything that must move at constant rate (the print head). */
export function winLinear(p: number, a: number, b: number) {
  return THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
}

/**
 * Stage windows over scroll progress 0 -> 1. Deliberately overlapping: parts start
 * moving before the previous one has settled, which is what makes the sequence read
 * as one continuous build rather than nine separate animations queued back to back.
 */
export const STAGES = {
  ghost: [0.0, 0.16],
  base: [0.1, 0.3],
  column: [0.24, 0.44],
  socket: [0.4, 0.55],
  bulb: [0.48, 0.62],
  shade: [0.52, 0.8],
  finial: [0.78, 0.88],
  ignite: [0.84, 1.0],
  settle: [0.9, 1.0],
} as const;

/** Every object the frame loop mutates. Populated by LampParts via callback refs. */
export interface LampRefs {
  root: THREE.Group | null;
  bed: THREE.Mesh | null;
  grid: THREE.Mesh | null;
  contactShadow: THREE.Mesh | null;
  base: THREE.Mesh | null;
  column: THREE.Group | null;
  socket: THREE.Mesh | null;
  bulb: THREE.Mesh | null;
  shadeOuter: THREE.Mesh | null;
  shadeInner: THREE.Mesh | null;
  rimRing: THREE.Mesh | null;
  printHead: THREE.Mesh | null;
  finial: THREE.Group | null;
  glow: THREE.Mesh | null;
  bulbLight: THREE.PointLight | null;
  /** Shared by both shade materials; its `.constant` is the print-wipe height. */
  clipPlane: THREE.Plane | null;
  /** Faint faceted preview of the finished lamp, visible only before p advances. */
  ghostGroup: THREE.Group | null;
  ghostMaterial: THREE.LineBasicMaterial | null;
}

export function createLampRefs(): LampRefs {
  return {
    root: null,
    bed: null,
    grid: null,
    contactShadow: null,
    base: null,
    column: null,
    socket: null,
    bulb: null,
    shadeOuter: null,
    shadeInner: null,
    rimRing: null,
    printHead: null,
    finial: null,
    glow: null,
    bulbLight: null,
    clipPlane: null,
    ghostGroup: null,
    ghostMaterial: null,
  };
}

/** Narrow a mesh's material to the standard material we know we assigned it. */
function standardMaterial(mesh: THREE.Mesh | null): THREE.MeshStandardMaterial | null {
  if (!mesh) return null;
  return mesh.material as THREE.MeshStandardMaterial;
}

function basicMaterial(mesh: THREE.Mesh | null): THREE.MeshBasicMaterial | null {
  if (!mesh) return null;
  return mesh.material as THREE.MeshBasicMaterial;
}

/**
 * Drive the whole scene from a single progress value.
 *
 * Only ever mutates position / scale / rotation / opacity / emissiveIntensity and the
 * clip plane's constant — nothing here touches a uniform that would trigger a shader
 * recompile mid-scroll, and nothing allocates. It runs every frame while scrolling.
 *
 * `time` is only used for the ignition flicker; everything else is a function of p alone.
 */
export function applyChoreography(refs: LampRefs, p: number, time: number): void {
  // --- Print bed --------------------------------------------------------
  // The bed is the stage itself, not a printed part — it's present at rest
  // (p=0, before any scroll) so a visitor who never scrolls sees a grounded
  // stage rather than an empty transparent canvas over the page background.
  {
    const mat = standardMaterial(refs.bed);
    if (mat) mat.opacity = 1;
  }
  {
    const mat = basicMaterial(refs.grid);
    if (mat) mat.opacity = 0.35;
  }

  // --- Ghost preview ------------------------------------------------------
  // A faint faceted outline of the finished lamp, standing in for the parts
  // that haven't printed yet. Without it, the moment before scrolling is
  // just the bare bed — this gives that moment something to look at, like a
  // slicer's print preview. Fades out as soon as the base actually starts
  // rising, and reappears symmetrically if the user scrubs back toward p=0,
  // since it's driven by the same p as everything else.
  const ghostFade = 1 - win(p, ...STAGES.ghost, easeOut);
  if (refs.ghostMaterial) refs.ghostMaterial.opacity = 0.3 * ghostFade;
  if (refs.ghostGroup) refs.ghostGroup.visible = ghostFade > 0.005;

  // --- Base rises out of the bed -------------------------------------------
  const baseP = win(p, ...STAGES.base);
  if (refs.base) {
    refs.base.position.y = LAMP_LAYOUT.baseY - 1.15 * (1 - baseP);
    const mat = standardMaterial(refs.base);
    // Reach full opacity in the first 45% of the window, so the base is solid
    // before it clears the bed plane rather than fading in mid-air above it.
    if (mat) mat.opacity = THREE.MathUtils.clamp(baseP / 0.45, 0, 1);
  }

  // --- Column descends onto the base ---------------------------------------
  const columnP = win(p, ...STAGES.column);
  if (refs.column) {
    refs.column.position.y = 2.55 * (1 - columnP);
    refs.column.rotation.y = -0.62 * (1 - columnP);
    refs.column.visible = columnP > 0.001;
  }

  // --- Socket ---------------------------------------------------------------
  const socketP = win(p, ...STAGES.socket);
  if (refs.socket) {
    refs.socket.position.y = LAMP_LAYOUT.socketY + 1.4 * (1 - socketP);
    const s = 0.85 + 0.15 * socketP;
    refs.socket.scale.setScalar(s);
    refs.socket.visible = socketP > 0.001;
  }

  // --- Bulb seats into the socket ------------------------------------------
  const bulbP = win(p, ...STAGES.bulb);
  if (refs.bulb) {
    refs.bulb.scale.setScalar(bulbP);
    refs.bulb.visible = bulbP > 0.001;
  }

  // --- Shade prints upward, band by band -----------------------------------
  // Linear, not eased: a print head moves at constant Z-feed, and that constant
  // rate is the entire reason this reads as printing rather than as growing.
  const shadeP = winLinear(p, ...STAGES.shade);
  const clipHeight = LAMP_LAYOUT.shadeY + (LAMP_LAYOUT.shadeTop - LAMP_LAYOUT.shadeY) * shadeP;
  if (refs.clipPlane) {
    // Plane normal is (0,-1,0), so `constant` is the world Y below which geometry
    // survives. Everything above the print head is clipped away.
    refs.clipPlane.constant = clipHeight;
  }
  const shadeVisible = shadeP > 0.001;
  if (refs.shadeOuter) refs.shadeOuter.visible = shadeVisible;
  if (refs.shadeInner) refs.shadeInner.visible = shadeVisible;

  if (refs.printHead) {
    const localY = clipHeight - LAMP_LAYOUT.shadeY;
    const radius = shadeRadiusAt(localY);
    refs.printHead.position.y = clipHeight;
    // Torus lies in its local XY plane (rotated flat by the mesh), so the ring
    // radius scales on X/Y; Z is the tube thickness and must stay at 1.
    refs.printHead.scale.set(radius, radius, 1);
    // Fade the nozzle line out as the shade tops out, so it doesn't linger.
    const fade = 1 - win(p, 0.78, 0.82, easeOut);
    const mat = basicMaterial(refs.printHead);
    if (mat) mat.opacity = shadeVisible ? fade : 0;
    refs.printHead.visible = shadeVisible && fade > 0.01;
  }

  // --- Finial + rim ring ----------------------------------------------------
  const finialP = win(p, ...STAGES.finial);
  if (refs.finial) {
    refs.finial.position.y = 0.9 * (1 - finialP);
    refs.finial.scale.setScalar(0.8 + 0.2 * finialP);
    refs.finial.visible = finialP > 0.001;
  }
  if (refs.rimRing) {
    refs.rimRing.scale.setScalar(0.9 + 0.1 * finialP);
    const mat = standardMaterial(refs.rimRing);
    if (mat) mat.opacity = finialP;
    refs.rimRing.visible = finialP > 0.001;
  }

  // --- Ignition -------------------------------------------------------------
  // easeOut, not easePremium: a light clicks on, it doesn't glide on.
  const igniteP = win(p, ...STAGES.ignite, easeOut);
  // A brief flicker as it catches, confined to the first third of the window.
  // Kept at 4.5% amplitude — enough to feel like a filament warming, not a strobe.
  const flickerWindow = 1 - THREE.MathUtils.clamp((p - 0.84) / 0.045, 0, 1);
  const flicker = 1 + 0.045 * flickerWindow * Math.sin(time * 46);

  const bulbMat = standardMaterial(refs.bulb);
  if (bulbMat) bulbMat.emissiveIntensity = 2.6 * igniteP * flicker;
  if (refs.bulbLight) refs.bulbLight.intensity = 9 * igniteP * flicker;

  const innerMat = standardMaterial(refs.shadeInner);
  if (innerMat) innerMat.emissiveIntensity = 0.55 * igniteP;

  if (refs.glow) {
    const s = 3.4 * igniteP;
    refs.glow.scale.set(s, s, 1);
    const mat = basicMaterial(refs.glow);
    if (mat) mat.opacity = 0.85 * igniteP;
    refs.glow.visible = igniteP > 0.001;
  }

  if (refs.contactShadow) {
    const mat = basicMaterial(refs.contactShadow);
    // Present from rest, same as the bed; gains weight once the lamp lights.
    if (mat) mat.opacity = 0.2 + 0.14 * igniteP;
  }

  // --- Final settle ---------------------------------------------------------
  // A turntable that resolves rather than one that spins.
  const settleP = win(p, ...STAGES.settle);
  if (refs.root) {
    refs.root.rotation.y = 0.11 * (1 - settleP);
    refs.root.position.y = LAMP_LAYOUT.groupY + 0.045 * (1 - settleP);
  }
}
