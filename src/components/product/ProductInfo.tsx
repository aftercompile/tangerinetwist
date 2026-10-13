"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Heart,
  Minus,
  Plus,
  Zap,
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
import { isLineSoldOut } from "@/lib/stock";
import { runMagicCheckout } from "@/lib/razorpay/magic-client";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";

export function ProductInfo({
  product,
  selectedVariant,
  onSelectVariant,
  magicCheckout = false,
}: {
  product: Product;
  // Undefined when the product has no variants at all — ProductDetail defaults this to
  // variants[0] whenever variants exist, so "has variants" and "one is selected" always
  // move together; there's no empty "please pick one" state to handle here.
  selectedVariant?: ProductVariant;
  onSelectVariant?: (variant: ProductVariant) => void;
  // Razorpay Magic Checkout is switched on (MAGIC_CHECKOUT_ENABLED): Buy Now opens it
  // right here instead of going via the cart and /checkout.
  magicCheckout?: boolean;
}) {
  const [quantity, setQuantity] = React.useState(1);
  const [personalization, setPersonalization] = React.useState("");
  const [ctaVisible, setCtaVisible] = React.useState(true);
  const [buying, setBuying] = React.useState(false);
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const router = useRouter();
  const reduced = useReducedMotion();
  const wished = has(product.slug);
  const isPersonalized = product.isPersonalized ?? false;
  const effectivePrice = selectedVariant?.price ?? product.price;
  // A sold-out product blocks every variant; otherwise it's the selected variant's own status.
  const soldOut = isLineSoldOut(product, selectedVariant);

  function variantLabel(v: ProductVariant): string {
    return [v.size, v.color].filter(Boolean).join(" / ") || "Default";
  }

  function handleAddToCart() {
    if (soldOut) return;
    addItem(product, quantity, selectedVariant);
  }

  async function handleBuyNow() {
    if (soldOut || buying) return;
    if (!magicCheckout) {
      // Magic Checkout is off: the original behaviour — add it and go to /checkout.
      addItem(product, quantity, selectedVariant);
      router.push("/checkout");
      return;
    }

    // Straight into Razorpay with just this product; the cart is left exactly as it was.
    setBuying(true);
    const outcome = await runMagicCheckout([
      { slug: product.slug, quantity, variantId: selectedVariant?.id },
    ]);
    setBuying(false);
    if (outcome.kind === "confirmed") router.push(`/order-confirmed?order=${encodeURIComponent(outcome.orderNumber)}`);
    else if (outcome.kind === "pending") router.push("/order-confirmed");
    else if (outcome.kind === "error") toast.error(outcome.message);
    // "dismissed": they closed the window — stay on the page.
  }

  // Mobile sticky bar mirrors the real CTA row's on-screen state via IntersectionObserver
  // rather than a scroll-position guess, so it appears exactly when the actual buttons
  // scroll out of view regardless of how tall the content above them is.
  //
  // Re-runs when `soldOut` flips: the CTA row only exists while the item is purchasable, so
  // switching between a sold-out and an available variant mounts/unmounts the element this
  // observes. With no row there's nothing to scroll past, so the sticky bar stays hidden.
  React.useEffect(() => {
    const el = ctaRef.current;
    if (!el) {
      setCtaVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [soldOut]);

  // One shared entrance rhythm for the info column — each block settles in slightly
  // after the last, so the page reads as one considered reveal rather than everything
  // appearing at once.
  const reveal = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, delay: reduced ? 0 : delay, ease: EASE_PREMIUM },
  });

  const wishlistButton = (
    <button
      onClick={() => toggle(product.slug, product.name)}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wished}
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border text-charcoal transition hover:border-charcoal active:scale-90"
    >
      <Heart className={cn("h-5 w-5 transition-colors", wished && "fill-tangerine-500 text-tangerine-500")} />
    </button>
  );

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
                    : "border-border text-charcoal hover:border-charcoal",
                  v.stock === "out-of-stock" && selectedVariant?.id !== v.id && "text-charcoal/50"
                )}
              >
                <span className={cn(v.stock === "out-of-stock" && "line-through decoration-1")}>{variantLabel(v)}</span>
                {v.stock === "out-of-stock" && <span className="ml-1.5 text-xs opacity-80">(sold out)</span>}
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

      {soldOut ? (
        // Sold out: no quantity or checkout controls — a disabled state plus the wishlist,
        // so someone who loves the piece can still save it for when it's back.
        <div className="mt-7">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="flex-1" disabled>
              Out of Stock
            </Button>
            {wishlistButton}
          </div>
          <p className="mt-3 text-sm text-muted">
            This piece is currently out of stock. Save it to your wishlist and check back soon.
          </p>
        </div>
      ) : (
        <>
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

          {wishlistButton}
        </div>

        {/* Buy Now leads: highlighted, with the reassurances that remove the last doubts, and
            Add to Cart as the quieter second choice. */}
        <div ref={ctaRef} className="mt-4 rounded-3xl border border-tangerine-200 bg-tangerine-50/70 p-3 sm:p-4">
          <Magnetic strength={0.15} className="w-full">
            <Button
              variant="accent"
              size="lg"
              className="w-full shadow-[0_6px_0_#C4521C] transition-transform active:translate-y-1 active:shadow-[0_2px_0_#C4521C]"
              disabled={buying}
              onClick={handleBuyNow}
            >
              <Zap className="h-4 w-4 fill-current" />
              {buying ? "Opening secure checkout…" : `Buy Now — ${formatINR(effectivePrice * quantity)}`}
            </Button>
          </Magnetic>
          <ul className="mt-3.5 grid grid-cols-3 gap-2 text-center text-[11px] leading-snug text-charcoal/80">
            <li className="flex flex-col items-center gap-1">
              <RotateCcw className="h-4 w-4 text-tangerine-600" />
              7-day easy returns
            </li>
            <li className="flex flex-col items-center gap-1">
              <Truck className="h-4 w-4 text-tangerine-600" />
              Free shipping over ₹799
            </li>
            <li className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-tangerine-600" />
              Secure · UPI, cards &amp; COD
            </li>
          </ul>
          <Button variant="outline" size="lg" className="mt-3.5 w-full bg-warm-white" onClick={handleAddToCart}>
            <ShoppingBag className="h-4 w-4" /> Add to Cart
          </Button>
        </div>

        </>
      )}

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
              {soldOut ? (
                <Button variant="outline" size="lg" className="shrink-0" disabled>
                  Out of Stock
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="lg" className="shrink-0 px-4" onClick={handleAddToCart} aria-label="Add to Cart">
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                  <Button variant="accent" size="lg" className="shrink-0" disabled={buying} onClick={handleBuyNow}>
                    <Zap className="h-4 w-4 fill-current" /> {buying ? "Opening…" : "Buy Now"}
                  </Button>
                </>
              )}
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
