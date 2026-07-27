"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { getProductBySlug } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const products = slugs
    .map((s) => getProductBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="container-wide py-14">
      <h1 className="h-display text-3xl md:text-4xl">Your Wishlist</h1>
      <p className="mt-2 text-sm text-muted">{products.length} saved items</p>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-beige">
            <Heart className="h-6 w-6 text-muted" />
          </div>
          <h2 className="h-display text-xl">Nothing saved yet</h2>
          <p className="max-w-sm text-sm text-muted">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Button variant="accent" size="lg" asChild>
            <Link href="/idols">Shop Decorative Idols</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
