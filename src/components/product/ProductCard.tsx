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
  const topBadge = visibleBadges[0];

  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* ── Desktop: overlay card with TiltCard, scrim, ratings, add-to-cart ── */}
      <TiltCard className="hidden md:block" maxTilt={5} lift={6}>
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

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent"
          />

          {visibleBadges.length > 0 && (
            <div className="absolute left-4 right-14 top-4 flex flex-col items-start gap-1.5">
              {visibleBadges.map((b) => (
                <Badge key={b} variant={b} className="max-w-full truncate">
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

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
            <Link href={`/product/${product.slug}`} className="w-fit">
              <h3 className="line-clamp-2 font-display text-lg leading-snug text-white">
                {product.name}
              </h3>
            </Link>
            <p className="truncate text-xs text-white/70">{product.material}</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} tone="light" />
              <RatingStars rating={product.rating} tone="light" />
            </div>

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

      {/* ── Mobile: clean card — image, name, price. No overlays on the photo. ── */}
      <div className="md:hidden">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige">
          <Link href={`/product/${product.slug}`} className="block h-full w-full">
            <ProductImagePlaceholder
              icon={product.icon}
              tone={product.images[0]?.tone ?? "beige"}
              src={product.images[0]?.src}
              alt={product.images[0]?.alt}
              className="h-full w-full"
              sizes="50vw"
            />
          </Link>

          {topBadge && (
            <Badge
              variant={topBadge}
              className="absolute left-2.5 top-2.5 max-w-[calc(100%-3rem)] truncate px-2 py-0.5 text-[9px]"
            >
              {BADGE_LABELS[topBadge]}
            </Badge>
          )}

          <button
            onClick={() => toggle(product.slug, product.name)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-charcoal/60 backdrop-blur-sm transition active:scale-95"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5",
                wished && "fill-tangerine-500 text-tangerine-500"
              )}
            />
          </button>
        </div>

        <Link href={`/product/${product.slug}`} className="mt-2.5 block">
          <h3 className="line-clamp-1 font-display text-[13px] leading-snug text-charcoal">
            {product.name}
          </h3>
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
            className="mt-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
