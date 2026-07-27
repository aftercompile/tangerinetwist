"use client";

import * as React from "react";
import { ZoomIn } from "lucide-react";
import { ProductImage } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");
  const image = images[active];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div>
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-beige"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        role="img"
        aria-label={image.alt}
      >
        <ProductImagePlaceholder
          icon={image.icon}
          tone={image.tone}
          src={image.src}
          alt={image.alt}
          className={cn(
            "h-full w-full transition-transform duration-500 ease-out",
            zoomed && "scale-[1.6]"
          )}
          iconClassName="transition-transform duration-500"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transformOrigin: origin }}
        />
        <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-warm-white/90 text-charcoal opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              aria-current={i === active}
              className={cn(
                "aspect-square overflow-hidden rounded-xl border-2 transition-colors",
                i === active ? "border-tangerine-500" : "border-transparent"
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
