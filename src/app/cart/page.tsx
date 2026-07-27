"use client";

import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { lines, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container-wide flex flex-col items-center justify-center gap-5 py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-beige">
          <ShoppingBag className="h-6 w-6 text-muted" />
        </div>
        <h1 className="h-display text-2xl">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted">
          Browse our collections and find something worth adding.
        </p>
        <Button variant="accent" size="lg" asChild>
          <Link href="/lamps">Shop Designer Lamps</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide py-14">
      <h1 className="h-display text-3xl md:text-4xl">Your Cart ({itemCount})</h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col divide-y divide-border">
          {lines.map((line) => (
            <li key={line.slug} className="flex gap-5 py-6 first:pt-0">
              <Link href={`/product/${line.slug}`} className="shrink-0">
                <ProductImagePlaceholder
                  icon={line.image.icon}
                  tone={line.image.tone as "warm" | "cool" | "charcoal" | "beige"}
                  className="h-28 w-28 rounded-2xl"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/product/${line.slug}`} className="text-base font-medium text-charcoal">
                      {line.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">{line.material}</p>
                  </div>
                  <button
                    onClick={() => removeItem(line.slug)}
                    aria-label={`Remove ${line.name}`}
                    className="text-muted transition hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-border px-1">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(line.slug, line.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-charcoal"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm">{line.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(line.slug, line.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-charcoal"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-base font-semibold text-charcoal">
                    {formatINR(line.price * line.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-3xl border border-border p-7">
          <h2 className="text-base font-medium text-charcoal">Order Summary</h2>
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="text-charcoal">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="text-charcoal">{subtotal >= 799 ? "Free" : formatINR(79)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold text-charcoal">
            <span>Total</span>
            <span>{formatINR(subtotal >= 799 ? subtotal : subtotal + 79)}</span>
          </div>
          <Button variant="accent" size="lg" className="mt-6 w-full" asChild>
            <Link href="/checkout">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
