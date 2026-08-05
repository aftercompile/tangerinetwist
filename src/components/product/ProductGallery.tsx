"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { TiltCard } from "@/components/shared/TiltCard";
import { cn } from "@/lib/utils";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";

// Matches the darkest stop of each ProductImagePlaceholder gradient — used to tint the
// ambient wash behind the frame so switching images reads as the whole scene shifting
// color, not just a photo swap inside a static box.
const GLOW_COLORS: Record<string, string> = {
  warm: "#E9D2AC",
  beige: "#DFCFAE",
  cool: "#DAD5C9",
  charcoal: "#5B5044",
};

// Shown before a photo's real aspect ratio is known. productImages stores no width/height
// (schema.ts), so instead of cropping every photo to a fixed box (object-cover), the real
// ratio is measured client-side once the <img> loads (handleImgLoad) and the frame resizes
// to match — this fallback is only visible for the first render of a not-yet-loaded photo.
const FALLBACK_RATIO = 0.8;
const SWIPE_THRESHOLD = 50;

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });
  const [ratios, setRatios] = React.useState<Record<string, number>>({});
  const reduced = useReducedMotion();
  const image = images[active];
  const glow = GLOW_COLORS[image.tone] ?? GLOW_COLORS.beige;
  const ratio = ratios[image.id] ?? FALLBACK_RATIO;

  function goTo(delta: number) {
    if (images.length < 2) return;
    setDirection(delta);
    setZoomed(false);
    setActive((i) => (i + delta + images.length) % images.length);
  }

  function selectImage(i: number) {
    setDirection(i > active ? 1 : -1);
    setZoomed(false);
    setActive(i);
  }

  function handleImgLoad(id: string, e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    setRatios((prev) => (prev[id] ? prev : { ...prev, [id]: img.naturalWidth / img.naturalHeight }));
  }

  // Only tracked while zoomed — pans the zoomed image to follow the cursor, same as before.
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  // Pan (not drag) so this never moves the frame itself — it only measures the gesture and
  // decides whether to advance, leaving the actual slide motion to the enter/exit variants
  // below. Framer's pan gesture has its own built-in movement threshold before it fires, so
  // a plain click/tap (used to toggle zoom) is unaffected.
  function handlePanEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(-1);
  }

  const slideVariants = {
    enter: (dir: number) => (reduced ? { opacity: 0 } : { x: dir >= 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => (reduced ? { opacity: 0 } : { x: dir >= 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative lg:sticky lg:top-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] opacity-40 blur-3xl transition-[background] duration-700"
        style={{ background: glow }}
      />

      <TiltCard maxTilt={4} lift={4} className="rounded-3xl">
        <motion.div
          className="group relative overflow-hidden rounded-3xl bg-beige shadow-[0_30px_60px_-25px_rgba(30,25,20,0.3)]"
          style={{ aspectRatio: ratio }}
          onMouseMove={handleMouseMove}
          onPanEnd={handlePanEnd}
          role="img"
          aria-label={image.alt}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={image.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: DURATION.base, ease: EASE_PREMIUM }}
              className="absolute inset-0"
              onClick={() => setZoomed((z) => !z)}
            >
              <div
                className={cn(
                  "h-full w-full transition-transform duration-500 ease-out",
                  zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                style={{
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                  transform: zoomed ? "scale(1.6)" : undefined,
                }}
              >
                <ProductImagePlaceholder
                  icon={image.icon}
                  tone={image.tone}
                  src={image.src}
                  alt={image.alt}
                  fit="contain"
                  className="h-full w-full"
                  onLoad={(e) => handleImgLoad(image.id, e)}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Reflects zoom state (in vs out) instead of always showing the same icon, since
              click now toggles zoom rather than just hinting at a hover effect. */}
          <div className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-warm-white/90 text-charcoal opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100">
            {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/90 text-charcoal shadow-soft transition hover:bg-warm-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(1);
                }}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/90 text-charcoal shadow-soft transition hover:bg-warm-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </motion.div>
      </TiltCard>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => selectImage(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl transition-all duration-300",
                i === active
                  ? "ring-2 ring-tangerine-500 ring-offset-2 ring-offset-warm-white"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <ProductImagePlaceholder icon={img.icon} tone={img.tone} src={img.src} alt={img.alt} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
