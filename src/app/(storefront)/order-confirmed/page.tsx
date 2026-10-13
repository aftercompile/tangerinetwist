import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

// Landing page after a "Buy Now" checkout (which skips the cart and /checkout). Shows only
// the order number we were handed — nothing is looked up, so there's nothing to leak — and
// only when it has the shape of one of our order numbers, since it comes from the URL.
const ORDER_NUMBER = /^TT-[0-9A-Z]{3,6}-[0-9A-Z]{4,12}$/;

export default function OrderConfirmedPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order && ORDER_NUMBER.test(searchParams.order) ? searchParams.order : null;

  return (
    <div className="container-wide flex flex-col items-center justify-center gap-5 py-32 text-center">
      <CheckCircle2 className="h-14 w-14 text-tangerine-500" strokeWidth={1.25} />
      <h1 className="h-display text-3xl">{orderNumber ? "Order confirmed" : "Payment received"}</h1>
      {orderNumber ? (
        <p className="text-sm text-muted">
          Order <span className="font-semibold text-charcoal">{orderNumber}</span>
        </p>
      ) : (
        <p className="max-w-sm text-sm text-muted">
          Your payment went through and your order is being recorded — it will appear in your account shortly.
        </p>
      )}
      <p className="max-w-sm text-sm text-muted">Thank you — your pieces are being prepared for print and finishing.</p>
      <Button variant="accent" size="lg" asChild>
        <Link href="/lamps">Continue Shopping</Link>
      </Button>
    </div>
  );
}
