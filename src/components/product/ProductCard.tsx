"use client";

import Link from "next/link";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { RatingStars } from "@/components/shared/RatingStars";
import { Price } from "@/components/shared/Price";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { QuickView } from "./QuickView";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const wished = has(product.slug);

  return (
    <>
      <div className={cn("group relative flex flex-col", className)}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige shadow-[0_0_0_0_rgba(27,24,21,0)] transition-shadow duration-500 ease-premium group-hover:shadow-card">
          <Link href={`/product/${product.slug}`} className="block h-full w-full">
            <ProductImagePlaceholder
              icon={product.icon}
              tone={product.images[0]?.tone ?? "beige"}
              src={product.images[0]?.src}
              alt={product.images[0]?.alt}
              className="h-full w-full transition-transform duration-900 ease-premium group-hover:scale-[1.06]"
            />
          </Link>
          {/* Warm scrim behind the action row so the buttons stay legible on
              light product art without dimming the image at rest. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/25 to-transparent opacity-0 transition-opacity duration-300 ease-premium group-hover:opacity-100"
          />

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badges.includes("bestseller") && <Badge variant="bestseller">Best Seller</Badge>}
            {product.badges.includes("new") && <Badge variant="new">New</Badge>}
            {product.badges.includes("limited") && <Badge variant="limited">Limited</Badge>}
          </div>

          <button
            onClick={() => toggle(product.slug, product.name)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-warm-white/90 text-charcoal shadow-soft backdrop-blur transition hover:scale-105"
          >
            <Heart className={cn("h-4 w-4", wished && "fill-tangerine-500 text-tangerine-500")} />
          </button>

          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 ease-premium group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-warm-white/95 text-xs font-medium text-charcoal shadow-soft backdrop-blur transition hover:bg-warm-white"
            >
              <Eye className="h-3.5 w-3.5" /> Quick View
            </button>
            <button
              onClick={() => addItem(product, 1)}
              aria-label="Add to cart"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal text-cream shadow-soft transition hover:bg-tangerine-600"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-1.5">
          <Link href={`/product/${product.slug}`} className="link-underline w-fit">
            <h3 className="text-[15px] font-medium text-charcoal">{product.name}</h3>
          </Link>
          <p className="text-xs text-muted">{product.tagline}</p>
          <p className="text-xs text-muted">{product.material}</p>
          <div className="mt-1 flex items-center justify-between">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
            <RatingStars rating={product.rating} />
          </div>
        </div>
      </div>

      <QuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </>
  );
}
