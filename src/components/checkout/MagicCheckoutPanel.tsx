"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Truck, Wallet } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { CartLineThumb } from "@/components/shared/CartLineThumb";
import { formatINR } from "@/lib/utils";
import { runMagicCheckout } from "@/lib/razorpay/magic-client";

/**
 * Checkout page when Razorpay Magic Checkout is switched on (MAGIC_CHECKOUT_ENABLED). Our
 * own address/payment form isn't needed: Magic collects the address, offers shipping,
 * coupons, prepaid and COD inside its own modal, and we only learn the result once it's
 * confirmed. The standard form stays one click away as a fallback.
 */
export function MagicCheckoutPanel({ prefill }: { prefill?: { name?: string; email?: string } }) {
  const { lines, subtotal, clear } = useCart();
  const [starting, setStarting] = React.useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = React.useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);

  async function handleCheckout() {
    setStarting(true);
    const outcome = await runMagicCheckout(
      lines.map((l) => ({ slug: l.slug, quantity: l.quantity, variantId: l.variantId, design: l.design })),
      prefill
    );
    setStarting(false);
    if (outcome.kind === "error") {
      toast.error(outcome.message);
    } else if (outcome.kind === "confirmed") {
      clear();
      setPlacedOrderNumber(outcome.orderNumber);
    } else if (outcome.kind === "pending") {
      clear();
      setAwaitingConfirmation(true);
    }
    // "dismissed": they closed the window; the cart is untouched and they can retry.
  }

  if (placedOrderNumber || awaitingConfirmation) {
    return (
      <div className="container-wide flex flex-col items-center justify-center gap-5 py-32 text-center">
        <CheckCircle2 className="h-14 w-14 text-tangerine-500" strokeWidth={1.25} />
        <h1 className="h-display text-3xl">{placedOrderNumber ? "Order confirmed" : "Payment received"}</h1>
        {placedOrderNumber ? (
          <p className="text-sm text-muted">
            Order <span className="font-semibold text-charcoal">{placedOrderNumber}</span>
          </p>
        ) : (
          <p className="max-w-sm text-sm text-muted">
            Your payment went through and your order is being recorded — it will appear in your account shortly.
          </p>
        )}
        <p className="max-w-sm text-sm text-muted">
          Thank you — your pieces are being prepared for print and finishing.
        </p>
        <Button variant="accent" size="lg" asChild>
          <Link href="/lamps">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-wide flex flex-col items-center justify-center gap-5 py-32 text-center">
        <h1 className="h-display text-2xl">Your cart is empty</h1>
        <Button variant="accent" size="lg" asChild>
          <Link href="/lamps">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide py-14">
      <h1 className="h-display text-3xl md:text-4xl">Checkout</h1>

      <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-4 text-sm text-muted">
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-600" />
              Enter or pick a saved address, and see delivery options for your PIN code.
            </li>
            <li className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-600" />
              Pay with UPI, card or netbanking — or Cash on Delivery where available. Coupons can be applied in the
              next step.
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-600" />
              Payments are handled securely by Razorpay.
            </li>
          </ul>

          <div>
            <Button variant="accent" size="lg" className="w-full sm:w-auto" disabled={starting} onClick={handleCheckout}>
              {starting ? "Opening secure checkout…" : `Continue to payment — ${formatINR(subtotal)}`}
            </Button>
            <p className="mt-3 text-xs text-muted">
              Having trouble?{" "}
              {/* Plain <a>, not <Link>: a full page load, so the standard checkout script never
                  shares a window with Magic Checkout's. */}
              <a href="/checkout?standard=1" className="underline underline-offset-2 hover:text-charcoal">
                Use standard checkout
              </a>
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-3xl bg-warm-white p-6 shadow-soft">
          <h2 className="font-display text-lg">Order Summary</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {lines.map((line) => (
              <li key={`${line.slug}-${line.variantId ?? ""}-${line.designKey ?? ""}`} className="flex gap-3">
                <CartLineThumb line={line} className="h-14 w-14 shrink-0 rounded-lg" />
                <div className="flex flex-1 justify-between text-sm">
                  <div>
                    <p className="font-medium text-charcoal">{line.name}</p>
                    {line.variantLabel && <p className="text-xs text-muted">{line.variantLabel}</p>}
                    <p className="text-xs text-muted">Qty {line.quantity}</p>
                  </div>
                  <span className="font-medium text-charcoal">{formatINR(line.price * line.quantity)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="text-charcoal">{formatINR(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">Shipping, any coupon and the final total are shown in the payment step.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
