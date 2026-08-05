"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Truck, CreditCard, ClipboardCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { formatINR } from "@/lib/utils";
import { calculateTotals } from "@/lib/orders";
import { placeOrder, createOrderForPayment, verifyRazorpayPayment } from "@/lib/actions/order-actions";
import { openFastrrCheckout } from "@/lib/fastrr/checkout-client";
import { INDIAN_STATES } from "@/lib/data/indian-states";
import { cn } from "@/lib/utils";

const paymentOptions = [
  { id: "online", label: "Pay Online (Card / UPI / Netbanking)" },
  { id: "cod", label: "Cash on Delivery" },
] as const;

// Razorpay Checkout is a hosted script, not an npm package — load it once and reuse.
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
}

const emptyShipping: ShippingForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pin: "",
};

export function CheckoutForm({ initialShipping }: { initialShipping?: Partial<ShippingForm> }) {
  const { lines, subtotal, clear } = useCart();
  const [payment, setPayment] = React.useState<"online" | "cod">("online");
  const [shipping, setShipping] = React.useState<ShippingForm>({ ...emptyShipping, ...initialShipping });
  const [submitting, setSubmitting] = React.useState(false);
  const [alternativePaying, setAlternativePaying] = React.useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = React.useState<string | null>(null);
  const { shipping: shippingCost, total } = calculateTotals(subtotal);

  // Escape hatch to Fastrr's hosted overlay for customers who'd rather not use this form —
  // doesn't require the shipping fields above to be filled in, since Fastrr's overlay
  // collects its own address. Reuses the same cart lines already bound via useCart().
  async function handleAlternativePayment(e: React.MouseEvent) {
    setAlternativePaying(true);
    await openFastrrCheckout(
      e,
      lines.map((l) => ({ slug: l.slug, quantity: l.quantity }))
    );
    setAlternativePaying(false);
  }

  function updateField<K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const items = lines.map((l) => ({ slug: l.slug, quantity: l.quantity }));

    if (payment === "cod") {
      const result = await placeOrder({ shipping: { ...shipping, paymentMethod: "cod" }, items });
      setSubmitting(false);
      if (result.error || !result.orderNumber) {
        toast.error(result.error ?? "Something went wrong placing your order.");
        return;
      }
      setPlacedOrderNumber(result.orderNumber);
      clear();
      return;
    }

    // Online payment: create the Razorpay order first, then open the hosted checkout —
    // never trust the client's own claim that payment succeeded, so the success handler
    // hands the result to verifyRazorpayPayment for server-side signature verification
    // rather than treating Razorpay's callback as fact.
    const created = await createOrderForPayment({ shipping: { ...shipping, paymentMethod: "online" }, items });
    if (created.error || !created.orderId || !created.razorpayOrderId || !created.keyId) {
      setSubmitting(false);
      toast.error(created.error ?? "Could not start payment.");
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setSubmitting(false);
      toast.error("Could not load the payment window. Check your connection and try again.");
      return;
    }

    const orderId = created.orderId;
    const RazorpayCtor = (
      window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void } }
    ).Razorpay;

    const rzp = new RazorpayCtor({
      key: created.keyId,
      amount: created.amountPaise,
      currency: "INR",
      name: "TangerineTwist",
      order_id: created.razorpayOrderId,
      prefill: { name: shipping.fullName, email: shipping.email, contact: shipping.phone },
      theme: { color: "#E86A2C" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        const verified = await verifyRazorpayPayment({
          orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        setSubmitting(false);
        if (verified.error || !verified.orderNumber) {
          toast.error(verified.error ?? "We couldn't confirm your payment — contact us with your order details.");
          return;
        }
        setPlacedOrderNumber(verified.orderNumber);
        clear();
      },
      modal: {
        // User closed the modal without paying — the order row stays pending; they can
        // just click Pay again, which starts a fresh Razorpay order.
        ondismiss: () => setSubmitting(false),
      },
    });
    rzp.open();
  }

  if (placedOrderNumber) {
    return (
      <div className="container-wide flex flex-col items-center justify-center gap-5 py-32 text-center">
        <CheckCircle2 className="h-14 w-14 text-tangerine-500" strokeWidth={1.25} />
        <h1 className="h-display text-3xl">Order confirmed</h1>
        <p className="text-sm text-muted">
          Order <span className="font-semibold text-charcoal">{placedOrderNumber}</span>
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

      <form onSubmit={handlePlaceOrder} className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-12">
          <Step icon={Truck} step="01" title="Shipping Details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                id="fullName"
                value={shipping.fullName}
                onChange={(v) => updateField("fullName", v)}
                required
              />
              <Field
                label="Phone Number"
                id="phone"
                type="tel"
                value={shipping.phone}
                onChange={(v) => updateField("phone", v)}
                required
              />
              <Field
                label="Email"
                id="email"
                type="email"
                value={shipping.email}
                onChange={(v) => updateField("email", v)}
                required
                className="sm:col-span-2"
              />
              <Field
                label="Address"
                id="address"
                value={shipping.address}
                onChange={(v) => updateField("address", v)}
                required
                className="sm:col-span-2"
              />
              <Field
                label="City"
                id="city"
                value={shipping.city}
                onChange={(v) => updateField("city", v)}
                required
              />
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={shipping.state} onValueChange={(v) => updateField("state", v)}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field
                label="PIN Code"
                id="pin"
                value={shipping.pin}
                onChange={(v) => updateField("pin", v)}
                required
              />
            </div>
          </Step>

          <Step icon={CreditCard} step="02" title="Payment Method">
            <div className="flex flex-col gap-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition-colors",
                    payment === opt.id ? "border-charcoal bg-beige" : "border-border"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    className="h-4 w-4 accent-tangerine-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Step>

          <Step icon={ClipboardCheck} step="03" title="Review & Place Order">
            <p className="text-sm text-muted">
              By placing this order you agree to our shipping and return policies.
              {payment === "online"
                ? " You'll complete payment in a secure Razorpay window next."
                : " Pay in cash when your order arrives."}
            </p>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="mt-5 w-full sm:w-auto"
              disabled={submitting || alternativePaying}
            >
              {submitting
                ? "Please wait..."
                : payment === "online"
                  ? `Pay — ${formatINR(total)}`
                  : `Place Order — ${formatINR(total)}`}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="mt-2 w-full sm:w-auto"
              disabled={submitting || alternativePaying}
              onClick={handleAlternativePayment}
            >
              {alternativePaying ? "Please wait..." : "Or pay another way"}
            </Button>
          </Step>
        </div>

        <aside className="h-fit rounded-3xl border border-border p-7">
          <h2 className="text-base font-medium text-charcoal">Order Summary</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.slug} className="flex gap-3">
                <ProductImagePlaceholder
                  icon={line.image.icon}
                  tone={line.image.tone as "warm" | "cool" | "charcoal" | "beige"}
                  src={line.image.src}
                  className="h-14 w-14 shrink-0 rounded-lg"
                />
                <div className="flex flex-1 justify-between text-sm">
                  <div>
                    <p className="font-medium text-charcoal">{line.name}</p>
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
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="text-charcoal">{shippingCost === 0 ? "Free" : formatINR(shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-charcoal">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Step({
  icon: Icon,
  step,
  title,
  children,
}: {
  icon: typeof Truck;
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-cream">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs text-muted">Step {step}</p>
          <h2 className="text-base font-medium text-charcoal">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  required,
  className,
  value,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  className?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
