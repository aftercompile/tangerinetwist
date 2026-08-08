"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Layers,
  Ruler,
  Weight,
} from "lucide-react";
import { Product, ProductVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shared/Price";
import { RatingStars } from "@/components/shared/RatingStars";
import { Magnetic } from "@/components/shared/Magnetic";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn, formatINR } from "@/lib/utils";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";

export function ProductInfo({
  product,
  selectedVariant,
  onSelectVariant,
}: {
  product: Product;
  // Undefined when the product has no variants at all — ProductDetail defaults this to
  // variants[0] whenever variants exist, so "has variants" and "one is selected" always
  // move together; there's no empty "please pick one" state to handle here.
  selectedVariant?: ProductVariant;
  onSelectVariant?: (variant: ProductVariant) => void;
}) {
  const [quantity, setQuantity] = React.useState(1);
  const [personalization, setPersonalization] = React.useState("");
  const [ctaVisible, setCtaVisible] = React.useState(true);
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const router = useRouter();
  const reduced = useReducedMotion();
  const wished = has(product.slug);
  const isPersonalized = product.isPersonalized ?? false;
  const effectivePrice = selectedVariant?.price ?? product.price;

  function variantLabel(v: ProductVariant): string {
    return [v.size, v.color].filter(Boolean).join(" / ") || "Default";
  }

  function handleAddToCart() {
    addItem(product, quantity, selectedVariant);
  }

  function handleBuyNow() {
    addItem(product, quantity, selectedVariant);
    router.push("/checkout");
  }

  // Mobile sticky bar mirrors the real CTA row's on-screen state via IntersectionObserver
  // rather than a scroll-position guess, so it appears exactly when the actual buttons
  // scroll out of view regardless of how tall the content above them is.
  React.useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // One shared entrance rhythm for the info column — each block settles in slightly
  // after the last, so the page reads as one considered reveal rather than everything
  // appearing at once.
  const reveal = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, delay: reduced ? 0 : delay, ease: EASE_PREMIUM },
  });

  return (
    <div>
      <motion.div {...reveal(0)} className="flex flex-wrap gap-1.5">
        {product.badges.includes("bestseller") && <Badge variant="bestseller">Best Seller</Badge>}
        {product.badges.includes("new") && <Badge variant="new">New</Badge>}
        {product.badges.includes("limited") && <Badge variant="limited">Limited Batch</Badge>}
      </motion.div>

      <motion.h1 {...reveal(0.05)} className="h-display mt-4 text-3xl md:text-4xl">
        {product.name}
      </motion.h1>
      <motion.p {...reveal(0.1)} className="mt-2 text-base text-muted">
        {product.tagline}
      </motion.p>

      <motion.div {...reveal(0.15)} className="mt-4">
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
      </motion.div>

      <motion.div {...reveal(0.2)} className="mt-6">
        <Price price={effectivePrice} compareAtPrice={product.compareAtPrice} size="lg" />
        <p className="mt-1 text-xs text-muted">Inclusive of all taxes. Shipping calculated at checkout.</p>
      </motion.div>

      {product.variants && product.variants.length > 0 && (
        <motion.div {...reveal(0.22)} className="mt-5">
          <Label>Choose an option</Label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariant?.(v)}
                aria-pressed={selectedVariant?.id === v.id}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  selectedVariant?.id === v.id
                    ? "border-charcoal bg-charcoal text-cream"
                    : "border-border text-charcoal hover:border-charcoal"
                )}
              >
                {variantLabel(v)}
                {v.stock === "low-stock" && <span className="ml-1.5 text-xs opacity-70">(low stock)</span>}
                {v.stock === "made-to-order" && <span className="ml-1.5 text-xs opacity-70">(made to order)</span>}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <motion.p {...reveal(0.25)} className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
        {product.description}
      </motion.p>

      <motion.dl {...reveal(0.3)} className="mt-6 grid grid-cols-1 gap-4 border-y border-border py-5 sm:grid-cols-3">
        <SpecStat icon={Layers} label="Material" value={product.material} />
        <SpecStat icon={Ruler} label="Dimensions" value={product.dimensions} />
        <SpecStat icon={Weight} label="Weight" value={product.weight} />
      </motion.dl>

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

      {/* Quantity and wishlist are compact, fixed-width controls — kept in their own row
          with w-fit so they never inherit flex-col's default full-width stretch on mobile,
          which previously blew the quantity pill out to the full row width. */}
      <div className="mt-7 flex items-center justify-between gap-3">
        <div className="flex h-14 w-fit items-center rounded-full border border-border px-1.5">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-beige active:scale-90"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-9 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-beige active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => toggle(product.slug, product.name)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border text-charcoal transition hover:border-charcoal active:scale-90"
        >
          <Heart className={cn("h-5 w-5 transition-colors", wished && "fill-tangerine-500 text-tangerine-500")} />
        </button>
      </div>

      <div ref={ctaRef}>
        <Magnetic strength={0.15} className="mt-3 w-full">
          <Button variant="accent" size="lg" className="w-full" onClick={handleAddToCart}>
            <ShoppingBag className="h-4 w-4" /> Add to Cart
          </Button>
        </Magnetic>
        <Button variant="outline" size="lg" className="mt-3 w-full" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-beige p-5 text-xs text-charcoal/80">
        <InfoRow icon={Truck} text="Dispatched in 2–4 business days · Free shipping above ₹799" />
        <InfoRow icon={RotateCcw} text="7-day easy returns on unused, undamaged items" />
        <InfoRow icon={ShieldCheck} text="Quality-checked and hand-finished before it ships" />
      </div>

      {/* Mobile-only sticky reorder bar. Desktop already keeps the real CTA in view within
          a two-column layout, so this exists purely for the long single-column mobile
          scroll where the buttons can end up far above the fold. */}
      <AnimatePresence>
        {!ctaVisible && (
          <motion.div
            initial={{ y: reduced ? 0 : 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : 96, opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE_PREMIUM }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-warm-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-8px_rgba(30,25,20,0.15)] backdrop-blur-sm lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-charcoal">{product.name}</p>
                <p className="text-sm font-semibold text-tangerine-600">{formatINR(effectivePrice)}</p>
              </div>
              <Button
                variant="accent"
                size="lg"
                className="shrink-0"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpecStat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beige">
        <Icon className="h-3.5 w-3.5 text-tangerine-600" strokeWidth={1.75} />
      </span>
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 text-sm text-charcoal">{value}</dd>
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
