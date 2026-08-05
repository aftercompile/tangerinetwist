"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/lib/types";
import { ProductImagePlaceholder, toneBackground } from "@/components/shared/ProductImagePlaceholder";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";

// 3:4 chosen to match the catalog's dominant photo shape (most source photos are ~3:4
// portrait) so those fill the frame edge to edge, while off-shape photos (landscape, very
// tall) letterbox onto a tone-matched band instead of being cropped — productImages has no
// stored width/height (schema.ts), so the frame can't adapt per-photo without a migration.
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const reduced = useReducedMotion();
  const image = images[active];
  const background = toneBackground(image.tone);

  function goTo(delta: number) {
    setActive((i) => (i + delta + images.length) % images.length);
  }

  function handleLightboxKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") goTo(-1);
    if (e.key === "ArrowRight") goTo(1);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`View ${image.alt || name} full size`}
        className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border"
        style={{ background }}
      >
        <div className="absolute inset-2 overflow-hidden rounded-xl sm:inset-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={image.id ?? active}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.base, ease: EASE_PREMIUM }}
              className="absolute inset-0"
            >
              <ProductImagePlaceholder
                icon={image.icon}
                tone={image.tone}
                src={image.src}
                alt={image.alt}
                fit="contain"
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="h-full w-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-warm-white/90 text-charcoal opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </div>
      </button>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg transition-all duration-300 sm:w-20",
                i === active
                  ? "ring-2 ring-tangerine-500 ring-offset-2 ring-offset-warm-white"
                  : "opacity-60 hover:opacity-100"
              )}
              style={{ background: toneBackground(img.tone) }}
            >
              <ProductImagePlaceholder
                icon={img.icon}
                tone={img.tone}
                src={img.src}
                alt={img.alt}
                fit="contain"
                sizes="80px"
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          title={image.alt || name}
          className="max-w-[90vw] bg-transparent p-0 shadow-none sm:max-w-4xl"
          onKeyDown={handleLightboxKeyDown}
        >
          {/* Height-driven, not width-driven: a 3:4 box sized from max-w-4xl would compute
              to ~1194px tall, well past the 85vh cap the base DialogContent already
              enforces — sizing from height instead lets the aspect-ratio shrink the width
              to fit, the same way it would for an <img>. */}
          <div
            className="relative mx-auto aspect-[3/4] h-[70vh] max-w-full sm:h-[80vh]"
            style={{ background }}
          >
            <ProductImagePlaceholder
              icon={image.icon}
              tone={image.tone}
              src={image.src}
              alt={image.alt}
              fit="contain"
              sizes="90vw"
              className="h-full w-full"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/90 text-charcoal shadow-soft transition hover:bg-warm-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/90 text-charcoal shadow-soft transition hover:bg-warm-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
