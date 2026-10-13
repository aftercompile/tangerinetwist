"use client";

import type { CartLine } from "@/context/CartContext";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { CharmSvg } from "@/components/letter-builder/CharmSvg";
import { cn } from "@/lib/utils";

/**
 * The picture for a cart/checkout line: the product photo, or — for a letter-builder
 * piece, which has no photo — the customer's own design drawn from the colours and styles
 * saved on the line.
 */
export function CartLineThumb({ line, className }: { line: CartLine; className?: string }) {
  if (line.design && line.builderConfig) {
    return (
      <span className={cn("flex items-center justify-center overflow-hidden bg-white ring-1 ring-charcoal/5", className)}>
        <CharmSvg design={line.design} config={line.builderConfig} className="w-full px-1" />
      </span>
    );
  }
  return (
    <ProductImagePlaceholder
      icon={line.image.icon}
      tone={line.image.tone as "warm" | "cool" | "charcoal" | "beige"}
      src={line.image.src}
      className={className}
    />
  );
}
