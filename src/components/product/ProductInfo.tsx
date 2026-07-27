"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shared/Price";
import { RatingStars } from "@/components/shared/RatingStars";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = React.useState(1);
  const [personalization, setPersonalization] = React.useState("");
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const router = useRouter();
  const wished = has(product.slug);
  const isPersonalized = product.slug === "personalized-desk-name-plate";

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/checkout");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {product.badges.includes("bestseller") && <Badge variant="bestseller">Best Seller</Badge>}
        {product.badges.includes("new") && <Badge variant="new">New</Badge>}
        {product.badges.includes("limited") && <Badge variant="limited">Limited Batch</Badge>}
      </div>

      <h1 className="h-display mt-4 text-3xl md:text-4xl">{product.name}</h1>
      <p className="mt-2 text-base text-muted">{product.tagline}</p>

      <div className="mt-4">
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
      </div>

      <div className="mt-6">
        <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
        <p className="mt-1 text-xs text-muted">Inclusive of all taxes. Shipping calculated at checkout.</p>
      </div>

      <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">{product.description}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Material</dt>
          <dd className="mt-1 text-charcoal">{product.material}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Dimensions</dt>
          <dd className="mt-1 text-charcoal">{product.dimensions}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Weight</dt>
          <dd className="mt-1 text-charcoal">{product.weight}</dd>
        </div>
      </dl>

      {isPersonalized && (
        <div className="mt-6">
          <Label htmlFor="personalization">Personalize this piece</Label>
          <Input
            id="personalization"
            placeholder="Enter name or title, e.g. Aditi Sharma"
            value={personalization}
            onChange={(e) => setPersonalization(e.target.value)}
            maxLength={24}
          />
        </div>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 items-center rounded-full border border-border px-2">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-charcoal"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-charcoal"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button variant="accent" size="lg" className="flex-1" onClick={() => addItem(product, quantity)}>
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </Button>
        <button
          onClick={() => toggle(product.slug, product.name)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border text-charcoal transition hover:border-charcoal"
        >
          <Heart className={cn("h-5 w-5", wished && "fill-tangerine-500 text-tangerine-500")} />
        </button>
      </div>
      <Button variant="outline" size="lg" className="mt-3 w-full" onClick={handleBuyNow}>
        Buy Now
      </Button>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-beige p-5 text-xs text-charcoal/80">
        <InfoRow icon={Truck} text="Dispatched in 2–4 business days · Free shipping above ₹799" />
        <InfoRow icon={RotateCcw} text="7-day easy returns on unused, undamaged items" />
        <InfoRow icon={ShieldCheck} text="Quality-checked and hand-finished before it ships" />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-tangerine-600" />
      <span>{text}</span>
    </div>
  );
}
