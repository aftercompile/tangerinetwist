"use client";

import * as React from "react";
import * as THREE from "three";
import {
  LAMP_LAYOUT,
  buildBaseGeometry,
  buildShadeGeometry,
  makeGridTexture,
  makeRadialTexture,
} from "./lamp-geometry";
import type { LampRefs } from "./choreography";

/**
 * The lamp's meshes.
 *
 * Geometries, materials and textures are built once in `useMemo` and passed to the
 * meshes as props. That means R3F does *not* own them (it only auto-disposes what it
 * created from JSX args), so this component disposes them itself on unmount — with
 * reactStrictMode on, a missed dispose shows up as a dev-time leak long before it ships.
 *
 * Nothing here animates. Every frame-by-frame value is written by `applyChoreography`
 * through the shared `refs` object, so this file stays a pure description of the object.
 */

interface LampPartsProps {
  refs: LampRefs;
  /** Radial segment counts drop on low-power devices — see LampCanvas. */
  quality: { shadeSegments: number; baseSegments: number };
}

export function LampParts({ refs, quality }: LampPartsProps) {
  const { shadeSegments, baseSegments } = quality;

  // --- Geometry -------------------------------------------------------------
  const shadeGeometry = React.useMemo(() => buildShadeGeometry(shadeSegments), [shadeSegments]);
  const baseGeometry = React.useMemo(() => buildBaseGeometry(baseSegments), [baseSegments]);

  // --- Textures -------------------------------------------------------------
  const gridTexture = React.useMemo(() => makeGridTexture(), []);
  const shadowTexture = React.useMemo(() => makeRadialTexture(0.55), []);
  const glowTexture = React.useMemo(() => makeRadialTexture(0.4), []);

  /**
   * The print-wipe clip plane. Normal points down, so geometry *below* `constant`
   * survives and the shade grows upward as choreography raises it.
   *
   * Created here and assigned at material-construction time, never mid-scroll:
   * attaching a clipping plane to a material forces a shader recompile, and doing
   * that at p=0.52 would drop a frame exactly when the shade starts printing.
   */
  const clipPlane = React.useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), LAMP_LAYOUT.shadeY),
    []
  );

  // --- Materials ------------------------------------------------------------
  const materials = React.useMemo(() => {
    const clip = [clipPlane];

    return {
      bed: new THREE.MeshStandardMaterial({
        color: "#F1E9DC",
        roughness: 0.96,
        metalness: 0,
        transparent: true,
        opacity: 0,
      }),
      grid: new THREE.MeshBasicMaterial({
        map: gridTexture ?? undefined,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
      contactShadow: new THREE.MeshBasicMaterial({
        color: "#1B1815",
        alphaMap: shadowTexture ?? undefined,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
      base: new THREE.MeshStandardMaterial({
        color: "#E4D8C3",
        roughness: 0.7,
        metalness: 0.02,
        transparent: true,
        opacity: 0,
      }),
      // One machined-metal material shared by the stem and both collars — the
      // material contrast against the printed cream parts is what stops the
      // whole object reading as a single blob of plastic.
      metal: new THREE.MeshStandardMaterial({
        color: "#2A2521",
        roughness: 0.42,
        metalness: 0.42,
      }),
      socket: new THREE.MeshStandardMaterial({
        color: "#1B1815",
        roughness: 0.5,
        metalness: 0.6,
      }),
      bulb: new THREE.MeshStandardMaterial({
        color: "#FFF3E2",
        emissive: new THREE.Color("#F0A164"),
        emissiveIntensity: 0,
        roughness: 0.14,
        metalness: 0,
        transparent: true,
        opacity: 0.92,
        // Sits inside the translucent shade; writing depth from here makes the
        // shade's inner face sort badly against it.
        depthWrite: false,
      }),
      // Deliberately NOT #FBF8F3 — that's the page's own bg-cream, and the shade
      // was rendering camouflaged against its own backdrop. This ivory reads as
      // a distinct object, and the lower roughness gives it a soft sheen instead
      // of the flat, no-highlight look pure matte diffuse has under one key light.
      shadeOuter: new THREE.MeshStandardMaterial({
        color: "#F6EEDF",
        roughness: 0.55,
        metalness: 0,
        side: THREE.FrontSide,
        clippingPlanes: clip,
      }),
      // BackSide twin so the inside of the shade can glow independently of the
      // outside — this is the surface the bulb's point light actually hits.
      shadeInner: new THREE.MeshStandardMaterial({
        color: "#F5C29B",
        roughness: 1,
        metalness: 0,
        side: THREE.BackSide,
        emissive: new THREE.Color("#E86A2C"),
        emissiveIntensity: 0,
        clippingPlanes: clip,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: "#E86A2C",
        roughness: 0.35,
        metalness: 0.18,
      }),
      rimRing: new THREE.MeshStandardMaterial({
        color: "#F0A164",
        roughness: 0.5,
        metalness: 0.25,
        transparent: true,
        opacity: 0,
      }),
      printHead: new THREE.MeshBasicMaterial({
        color: "#E86A2C",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
      // Additive quad standing in for a bloom pass. The camera never orbits, so
      // it needs no billboarding and costs one transparent draw instead of a
      // full-screen render target.
      glow: new THREE.MeshBasicMaterial({
        map: glowTexture ?? undefined,
        color: "#FFB877",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    };
  }, [clipPlane, gridTexture, shadowTexture, glowTexture]);

  // Hand the plane to the frame loop; its `.constant` is the print-wipe height.
  React.useEffect(() => {
    refs.clipPlane = clipPlane;
    return () => {
      refs.clipPlane = null;
    };
  }, [refs, clipPlane]);

  // --- Disposal -------------------------------------------------------------
  React.useEffect(() => {
    return () => {
      shadeGeometry.dispose();
      baseGeometry.dispose();
      gridTexture?.dispose();
      shadowTexture?.dispose();
      glowTexture?.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    };
  }, [shadeGeometry, baseGeometry, gridTexture, shadowTexture, glowTexture, materials]);

  return (
    <group ref={(node) => {
          refs.root = node;
        }} position={[0, LAMP_LAYOUT.groupY, 0]}>
      {/* Print bed */}
      <mesh
        ref={(node) => {
          refs.bed = node;
        }}
        material={materials.bed}
        position={[0, LAMP_LAYOUT.bedY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[3.2, 72]} />
      </mesh>

      <mesh
        ref={(node) => {
          refs.grid = node;
        }}
        material={materials.grid}
        position={[0, LAMP_LAYOUT.gridY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.9, 3.2, 72, 1]} />
      </mesh>

      {/* Fake contact shadow — cheaper than a real shadow map by an entire depth pass */}
      <mesh
        ref={(node) => {
          refs.contactShadow = node;
        }}
        material={materials.contactShadow}
        position={[0, LAMP_LAYOUT.contactShadowY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.35, 48]} />
      </mesh>

      {/* Base */}
      <mesh
        ref={(node) => {
          refs.base = node;
        }}
        geometry={baseGeometry}
        material={materials.base}
        position={[0, LAMP_LAYOUT.baseY, 0]}
      />

      {/* Column + collars ride one group so they descend together */}
      <group ref={(node) => {
          refs.column = node;
        }}>
        <mesh material={materials.metal} position={[0, LAMP_LAYOUT.lowerCollarY, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 48]} />
        </mesh>
        <mesh material={materials.metal} position={[0, LAMP_LAYOUT.columnY, 0]}>
          <cylinderGeometry args={[0.13, 0.17, 1.35, 48, 1]} />
        </mesh>
        <mesh material={materials.metal} position={[0, LAMP_LAYOUT.upperCollarY, 0]}>
          <cylinderGeometry args={[0.175, 0.175, 0.06, 48]} />
        </mesh>
      </group>

      {/* Socket */}
      <mesh
        ref={(node) => {
          refs.socket = node;
        }}
        material={materials.socket}
        position={[0, LAMP_LAYOUT.socketY, 0]}
      >
        <cylinderGeometry args={[0.16, 0.13, 0.22, 32]} />
      </mesh>

      {/* Bulb + the light it actually casts */}
      <mesh
        ref={(node) => {
          refs.bulb = node;
        }}
        material={materials.bulb}
        position={[0, LAMP_LAYOUT.bulbY, 0]}
        renderOrder={1}
      >
        <sphereGeometry args={[0.28, 32, 24]} />
      </mesh>
      <pointLight
        ref={(node) => {
          refs.bulbLight = node;
        }}
        position={[0, LAMP_LAYOUT.bulbY, 0]}
        color="#FFB877"
        distance={6}
        decay={2}
        intensity={0}
      />

      {/* Glow bloom */}
      <mesh
        ref={(node) => {
          refs.glow = node;
        }}
        material={materials.glow}
        position={[0, LAMP_LAYOUT.bulbY, 0.05]}
        renderOrder={2}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>

      {/* Shade: two meshes, one geometry, opposite faces */}
      <mesh
        ref={(node) => {
          refs.shadeOuter = node;
        }}
        geometry={shadeGeometry}
        material={materials.shadeOuter}
        position={[0, LAMP_LAYOUT.shadeY, 0]}
      />
      <mesh
        ref={(node) => {
          refs.shadeInner = node;
        }}
        geometry={shadeGeometry}
        material={materials.shadeInner}
        position={[0, LAMP_LAYOUT.shadeY, 0]}
      />

      {/* Nozzle line that rides the clip plane while the shade prints */}
      <mesh
        ref={(node) => {
          refs.printHead = node;
        }}
        material={materials.printHead}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <torusGeometry args={[1, 0.007, 8, 96]} />
      </mesh>

      {/* Tangerine rim at the widest point of the silhouette */}
      <mesh
        ref={(node) => {
          refs.rimRing = node;
        }}
        material={materials.rimRing}
        position={[0, LAMP_LAYOUT.shadeY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.985, 0.018, 12, 96]} />
      </mesh>

      {/* Finial — the one saturated brand accent on the object */}
      <group ref={(node) => {
          refs.finial = node;
        }}>
        <mesh material={materials.accent} position={[0, LAMP_LAYOUT.finialStubY, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 24]} />
        </mesh>
        <mesh material={materials.accent} position={[0, LAMP_LAYOUT.finialCapY, 0]}>
          <sphereGeometry args={[0.1, 24, 16]} />
        </mesh>
      </group>
    </group>
  );
}
