"use client";

// Pre-redesign gallery — aspect-square frame with object-cover (crops non-square photos)
// and a hover-triggered 1.6x zoom. Not imported anywhere; kept only so the old look can be
// restored by swapping ProductGallery.tsx's import in product/[slug]/page.tsx to this file.
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ZoomIn } from "lucide-react";
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

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });
  const reduced = useReducedMotion();
  const image = images[active];
  const glow = GLOW_COLORS[image.tone] ?? GLOW_COLORS.beige;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="relative lg:sticky lg:top-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] opacity-40 blur-3xl transition-[background] duration-700"
        style={{ background: glow }}
      />

      <TiltCard maxTilt={4} lift={4} className="rounded-3xl">
        <div
          className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-beige shadow-[0_30px_60px_-25px_rgba(30,25,20,0.3)]"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          role="img"
          aria-label={image.alt}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={image.id ?? active}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: DURATION.base, ease: EASE_PREMIUM }}
              className="absolute inset-0"
            >
              <div
                className="h-full w-full transition-transform duration-500 ease-out"
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
                  className="h-full w-full"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-warm-white/90 text-charcoal opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" />
          </div>
        </div>
      </TiltCard>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
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
