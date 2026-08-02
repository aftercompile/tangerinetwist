"use client";

import Link from "next/link";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Product, ProductBadge } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { RatingStars } from "@/components/shared/RatingStars";
import { Price } from "@/components/shared/Price";
import { TiltCard } from "@/components/shared/TiltCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { QuickView } from "./QuickView";

const BADGE_LABELS: Record<ProductBadge, string> = {
  bestseller: "Best Seller",
  new: "New Arrival",
  limited: "Limited",
  "artist-pick": "Artist Pick",
  "hand-finished": "Hand Finished",
  signature: "Signature Collection",
  "premium-finish": "Premium Finish",
};

// At most 2 badges ever show on a card, in this priority order — a stack of
// five stamps reads as a clearance rack, not a gallery piece.
const BADGE_PRIORITY: ProductBadge[] = [
  "signature",
  "artist-pick",
  "limited",
  "bestseller",
  "hand-finished",
  "premium-finish",
  "new",
];

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const wished = has(product.slug);
  const visibleBadges = BADGE_PRIORITY.filter((b) => product.badges.includes(b)).slice(0, 2);

  return (
    <>
      <TiltCard className={cn("group relative flex flex-col", className)} maxTilt={5} lift={6}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-beige shadow-soft transition-shadow duration-500 ease-premium group-hover:shadow-lift">
          <Link href={`/product/${product.slug}`} className="block h-full w-full">
            <ProductImagePlaceholder
              icon={product.icon}
              tone={product.images[0]?.tone ?? "beige"}
              src={product.images[0]?.src}
              alt={product.images[0]?.alt}
              className="h-full w-full transition-transform duration-1000 ease-premium group-hover:scale-[1.08]"
            />
          </Link>

          {/* Permanent (not hover-only) bottom scrim so the overlaid info stays legible at rest. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent"
          />

          {visibleBadges.length > 0 && (
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {visibleBadges.map((b) => (
                <Badge key={b} variant={b}>
                  {BADGE_LABELS[b]}
                </Badge>
              ))}
            </div>
          )}

          <button
            onClick={() => toggle(product.slug, product.name)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-soft backdrop-blur-md transition hover:scale-110 hover:bg-white/25"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform",
                wished && "scale-110 fill-tangerine-500 text-tangerine-500"
              )}
            />
          </button>

          {/* Overlaid info — replaces the old below-image stack entirely. */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
            <Link href={`/product/${product.slug}`} className="w-fit">
              <h3 className="font-display text-lg leading-snug text-white">{product.name}</h3>
            </Link>
            <p className="text-xs text-white/70">{product.material}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} tone="light" />
              <RatingStars rating={product.rating} tone="light" />
            </div>

            {/* Quick actions reveal on hover/focus only. */}
            <div className="mt-3 flex max-h-0 gap-2 overflow-hidden opacity-0 transition-all duration-300 ease-premium group-hover:max-h-14 group-hover:opacity-100 group-focus-within:max-h-14 group-focus-within:opacity-100">
              <button
                onClick={() => setQuickViewOpen(true)}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/95 text-xs font-medium text-charcoal shadow-soft backdrop-blur transition hover:bg-white"
              >
                <Eye className="h-3.5 w-3.5" /> Quick View
              </button>
              <button
                onClick={() => addItem(product, 1)}
                aria-label="Add to cart"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tangerine-500 text-white shadow-soft transition hover:bg-tangerine-600"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </TiltCard>

      <QuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </>
  );
}
