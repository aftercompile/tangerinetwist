"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { LampParts } from "./LampParts";
import { applyChoreography, createLampRefs } from "./choreography";

/**
 * The bridge between the page's scroll position and the three.js scene.
 *
 * The rule this file exists to enforce: **the MotionValue is read inside `useFrame`,
 * never subscribed to for rendering.** Framer Motion's `useScroll` fires on every
 * scroll event; turning those into React state would re-render the whole scene graph
 * dozens of times a second and make the animation slower the more of it there is.
 * Reading `progress.get()` in the frame loop costs nothing and re-renders nothing.
 *
 * R3F v8 renders into its own reconciler root, so React *context* doesn't cross the
 * <Canvas> boundary — but props do, and a MotionValue is a stable object identity,
 * which is why it can be passed straight in.
 */

interface LampRigProps {
  progress: MotionValue<number>;
  /**
   * When true the lamp is pinned to its finished, lit state and scroll no longer
   * scrubs it. Passed down rather than read here so the whole canvas subtree has
   * exactly one source of truth for it.
   */
  reduced: boolean;
  /** Set by an IntersectionObserver on the scroll track — a ref, never state. */
  pausedRef: React.MutableRefObject<boolean>;
  quality: { shadeSegments: number; baseSegments: number };
}

export function LampRig({ progress, reduced, pausedRef, quality }: LampRigProps) {
  const refs = React.useMemo(() => createLampRefs(), []);
  const invalidate = useThree((state) => state.invalidate);

  // Start already-assembled for reduced motion so the very first rendered frame is
  // the finished lamp — no assembly plays, not even briefly.
  const smooth = React.useRef(reduced ? 1 : 0);

  /**
   * The one subscription in the file, and the reason it's justified: with
   * `frameloop="demand"` nothing renders unless something asks it to, so scrolling
   * has to wake the loop. This is the first use of useMotionValueEvent in the
   * codebase — it earns its place here specifically because the alternative
   * (an always-on rAF loop) burns GPU on a static lamp forever.
   */
  useMotionValueEvent(progress, "change", () => {
    if (!pausedRef.current) invalidate();
  });

  useFrame((state, delta) => {
    if (pausedRef.current) return;

    const target = reduced ? 1 : progress.get();

    if (reduced) {
      smooth.current = 1;
    } else {
      // Frame-rate-independent exponential damping — the equivalent of GSAP's
      // `scrub: 1`. lambda 6 gives a scrubbed, slightly weighty follow; higher
      // tracks the scrollbar more tightly, lower floats more.
      // delta is clamped so restoring a backgrounded tab can't snap the lamp
      // through the whole build in a single frame.
      smooth.current = THREE.MathUtils.damp(
        smooth.current,
        target,
        6,
        Math.min(delta, 0.05)
      );
    }

    applyChoreography(refs, smooth.current, state.clock.elapsedTime);

    // Keep the loop alive until the damping has actually caught up with the
    // scroll position, then let it sleep. This is what makes "demand" work with
    // an easing follow rather than snapping to the target in one frame.
    if (!reduced && Math.abs(target - smooth.current) > 1e-4) invalidate();
  });

  return (
    <>
      <ResponsiveCamera />

      {/*
        Studio rig standing in for an <Environment> HDRI — the hemisphere light is
        what does that job, at zero network cost. The cool fill is deliberate: it
        keeps the cream from going muddy where the warm key falls off, and the
        tangerine rim from behind-left separates the shade from a page background
        that is very nearly the same value.
      */}
      <hemisphereLight color="#FBF8F3" groundColor="#E4D8C3" intensity={0.42} />
      <ambientLight color="#FDFCFA" intensity={0.34} />
      <directionalLight position={[3.2, 5.0, 4.0]} intensity={1.55} color="#FFF6EA" />
      <directionalLight position={[-4.0, 2.0, 2.5]} intensity={0.48} color="#E9F0FA" />
      <directionalLight position={[-1.5, 3.0, -4.5]} intensity={0.95} color="#F0A164" />

      <LampParts refs={refs} quality={quality} />
    </>
  );
}

/**
 * Dolly the camera back on narrow viewports so the lamp stays fully in frame
 * without changing the composition's proportions.
 */
function ResponsiveCamera() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const invalidate = useThree((state) => state.invalidate);

  React.useEffect(() => {
    const z = width < 640 ? 8.6 : width < 1024 ? 7.9 : 7.2;
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, width, invalidate]);

  return null;
}
