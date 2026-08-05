import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncFastrrOrder } from "@/lib/db/fastrr-sync";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// This page is never navigated to directly — it's the redirect_url Fastrr's checkout
// overlay sends the customer back to once they finish (or abandon) checkout, landing here
// as /checkout/fastrr?oid=<fastrr_order_id>&ost=<status>. The overlay itself is triggered
// by the "Or pay another way" button inside CheckoutForm.tsx (see fastrr-checkout-actions.ts),
// not from a form on this page. Lives at /checkout/fastrr rather than /checkout itself
// since /checkout is the primary Razorpay-based checkout form again.
export default async function FastrrCheckoutLandingPage({
  searchParams,
}: {
  searchParams: { oid?: string; ost?: string };
}) {
  const { oid, ost } = searchParams;

  if (oid && ost === "SUCCESS") {
    const result = await syncFastrrOrder(oid);
    if (result.orderNumber) {
      return (
        <div className="container-wide flex flex-col items-center justify-center gap-5 py-32 text-center">
          <CheckCircle2 className="h-14 w-14 text-tangerine-500" strokeWidth={1.25} />
          <h1 className="h-display text-3xl">Order confirmed</h1>
          <p className="text-sm text-muted">
            Order <span className="font-semibold text-charcoal">{result.orderNumber}</span>
          </p>
          <p className="max-w-sm text-sm text-muted">
            Thank you — your pieces are being prepared for print and finishing. A confirmation has
            been sent to your email.
          </p>
          <Button variant="accent" size="lg" asChild>
            <Link href="/lamps">Continue Shopping</Link>
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="container-wide flex flex-col items-center justify-center gap-5 py-32 text-center">
      <XCircle className="h-14 w-14 text-muted" strokeWidth={1.25} />
      <h1 className="h-display text-3xl">Checkout didn&apos;t complete</h1>
      <p className="max-w-sm text-sm text-muted">
        Your order wasn&apos;t placed — nothing was charged. Your cart is still saved if you&apos;d
        like to try again.
      </p>
      <Button variant="accent" size="lg" asChild>
        <Link href="/cart">Back to Cart</Link>
      </Button>
    </div>
  );
}
