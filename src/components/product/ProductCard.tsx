"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Product, ProductBadge } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { RatingStars } from "@/components/shared/RatingStars";
import { Price } from "@/components/shared/Price";
import { TiltCard } from "@/components/shared/TiltCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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
  const wished = has(product.slug);
  const visibleBadges = BADGE_PRIORITY.filter((b) => product.badges.includes(b)).slice(0, 2);

  return (
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
          <div className="absolute left-4 right-14 top-4 flex flex-col items-start gap-1.5">
            {/* whitespace-normal previously let a long label ("Premium Finish", "Signature
                Collection") wrap to two lines inside a rounded-full pill on a narrow
                2-up mobile card — a stadium shape stretched around a near-square block of
                text renders as a lopsided oval, not a badge. Truncating to one line (with
                max-w-full so the flex item actually has a width to truncate against) fixes
                that outright; only showing the single top-priority badge below `sm` cuts
                the remaining clutter a cramped mobile card doesn't have room for anyway. */}
            {visibleBadges.map((b, i) => (
              <Badge
                key={b}
                variant={b}
                className={cn("max-w-full truncate", i > 0 && "hidden sm:inline-flex")}
              >
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

        {/* Overlaid info — replaces the old below-image stack entirely. Clamped/truncated
            so a long name or a narrow (2-up mobile) card can never grow tall enough to
            push into the badges pinned at the top of the same image. */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 sm:p-5">
          <Link href={`/product/${product.slug}`} className="w-fit">
            <h3 className="line-clamp-2 font-display text-base leading-snug text-white sm:text-lg">
              {product.name}
            </h3>
          </Link>
          <p className="truncate text-xs text-white/70">{product.material}</p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} tone="light" />
            <RatingStars rating={product.rating} tone="light" />
          </div>

          {/* Add to cart reveals on hover/focus only. */}
          <div className="mt-3 flex max-h-0 gap-2 overflow-hidden opacity-0 transition-all duration-300 ease-premium group-hover:max-h-14 group-hover:opacity-100 group-focus-within:max-h-14 group-focus-within:opacity-100">
            <button
              onClick={() => addItem(product, 1)}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-tangerine-500 text-xs font-medium text-white shadow-soft transition hover:bg-tangerine-600"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
