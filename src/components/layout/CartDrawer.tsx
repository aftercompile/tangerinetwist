"use client";

import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const { lines, isOpen, setOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent title={`Shopping cart, ${itemCount} items`}>
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="h-display text-lg">Your Cart ({itemCount})</h2>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-beige">
              <ShoppingBag className="h-6 w-6 text-muted" />
            </div>
            <p className="text-sm text-muted">Your cart is empty. Let&apos;s fix that.</p>
            <Button variant="accent" onClick={() => setOpen(false)} asChild>
              <Link href="/lamps">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-border">
                {lines.map((line) => (
                  <li key={line.slug} className="flex gap-4 py-5">
                    <Link href={`/product/${line.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                      <ProductImagePlaceholder
                        icon={line.image.icon}
                        tone={line.image.tone as "warm" | "cool" | "charcoal" | "beige"}
                        src={line.image.src}
                        className="h-20 w-20 rounded-xl"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${line.slug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium text-charcoal"
                          >
                            {line.name}
                          </Link>
                          <p className="text-xs text-muted">{line.material}</p>
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
                            className="flex h-7 w-7 items-center justify-center text-charcoal"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-xs">{line.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(line.slug, line.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-charcoal"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-charcoal">
                          {formatINR(line.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-6 py-6">
              <div className="mb-1 flex items-center justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span className="text-base font-semibold text-charcoal">{formatINR(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-muted">Shipping and taxes calculated at checkout.</p>
              <Button variant="accent" size="lg" className="w-full" asChild>
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Checkout
                </Link>
              </Button>
              <Button variant="ghost" size="md" className="mt-2 w-full" asChild>
                <Link href="/cart" onClick={() => setOpen(false)}>
                  View Cart
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
