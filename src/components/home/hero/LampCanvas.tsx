"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { LampRig } from "./LampRig";
import { DURATION } from "@/lib/motion";

/**
 * The WebGL boundary.
 *
 * This module and the ones it imports are the *only* place `three` and
 * `@react-three/fiber` appear. It is loaded exclusively through
 * `next/dynamic(..., { ssr: false })` from Hero.tsx, which is what keeps ~220KB of
 * three out of the page's initial JS and off the LCP path. If you ever find
 * yourself importing this from a server component, the bundle boundary has leaked.
 *
 * Because nothing here ever server-renders, this is also the one place in the hero
 * where branching on device capability is safe — there is no server HTML to mismatch.
 */

interface LampCanvasProps {
  progress: MotionValue<number>;
  reduced: boolean;
  pausedRef: React.MutableRefObject<boolean>;
}

/** Decide once, at mount, what this device can comfortably render. */
function detectCapability() {
  if (typeof window === "undefined") {
    return { supported: false, coarse: false };
  }

  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;

  // Deliberately NOT navigator.hardwareConcurrency: WebKit clamps it to 2 on iOS
  // to frustrate fingerprinting, so it reports the same value for an iPhone 16 Pro
  // as for a decade-old handset. Gating on it disqualified every iPhone and left
  // them all showing the static poster.
  //
  // deviceMemory is Chrome/Android-only and simply absent on iOS, so it can only
  // ever downgrade the devices it actually describes. The floor is set low on
  // purpose — the dpr, LOD and no-shadow-map settings below are what carry mobile;
  // this only catches hardware that genuinely cannot.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const weak = typeof memory === "number" && memory <= 1;

  let hasWebGL = false;
  try {
    const probe = document.createElement("canvas");
    const ctx = probe.getContext("webgl2") ?? probe.getContext("webgl");
    hasWebGL = Boolean(ctx);
    // iOS caps how many WebGL contexts can exist at once and counts this probe
    // against that budget, so hand it back immediately — otherwise the real
    // canvas can be refused a context or lose one straight after creation.
    ctx?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    hasWebGL = false;
  }

  return { supported: hasWebGL && !weak, coarse };
}

export function LampCanvas({ progress, reduced, pausedRef }: LampCanvasProps) {
  // null = not yet probed. Probing in an effect (not during render) keeps this
  // component's first render cheap and identical regardless of device.
  const [capability, setCapability] = React.useState<ReturnType<typeof detectCapability> | null>(
    null
  );
  const [ready, setReady] = React.useState(false);
  const [lost, setLost] = React.useState(false);

  React.useEffect(() => {
    setCapability(detectCapability());
  }, []);

  const quality = React.useMemo(() => {
    const coarse = capability?.coarse ?? false;
    return {
      shadeSegments: coarse ? 96 : 192,
      baseSegments: coarse ? 48 : 96,
    };
  }, [capability]);

  // No WebGL, or a device we've decided shouldn't try: render nothing and let the
  // always-mounted CSS poster underneath stand in as the hero image.
  if (!capability?.supported || lost) return null;

  const coarse = capability.coarse;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 transition-opacity ease-premium"
      style={{
        opacity: ready ? 1 : 0,
        transitionDuration: `${DURATION.slow}s`,
      }}
    >
      <Canvas
        // Nothing animates on its own — the scene only redraws when scroll (or a
        // resize) asks it to, so a settled lamp costs zero GPU.
        frameloop="demand"
        dpr={[1, coarse ? 1.35 : 1.75]}
        camera={{ position: [0, 0, 7.2], fov: 34, near: 0.1, far: 40 }}
        gl={{
          antialias: !coarse, // MSAA is disproportionately expensive on tiled mobile GPUs
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          // Required for the shade's print-wipe; the clip plane itself is created
          // and bound to the materials in LampParts.
          gl.localClippingEnabled = true;
          gl.setClearAlpha(0);

          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              // Preventing the default lets the browser attempt a restore, but we
              // fall back to the poster rather than trying to rebuild the scene.
              event.preventDefault();
              setLost(true);
            },
            { passive: false }
          );

          setReady(true);
        }}
      >
        <LampRig
          progress={progress}
          reduced={reduced}
          pausedRef={pausedRef}
          quality={quality}
        />
      </Canvas>
    </div>
  );
}
