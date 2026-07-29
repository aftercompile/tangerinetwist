"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Truck, CreditCard, ClipboardCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { formatINR } from "@/lib/utils";
import { calculateTotals } from "@/lib/orders";
import { placeOrder } from "@/lib/actions/order-actions";
import { cn } from "@/lib/utils";

const paymentOptions = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "upi", label: "UPI" },
  { id: "cod", label: "Cash on Delivery" },
] as const;

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pin: string;
}

const emptyShipping: ShippingForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  pin: "",
};

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const [payment, setPayment] = React.useState<"card" | "upi" | "cod">("upi");
  const [shipping, setShipping] = React.useState<ShippingForm>(emptyShipping);
  const [submitting, setSubmitting] = React.useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = React.useState<string | null>(null);
  const { shipping: shippingCost, total } = calculateTotals(subtotal);

  function updateField<K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await placeOrder({
        shipping: { ...shipping, paymentMethod: payment },
        items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
      });

      if (result.error || !result.orderNumber) {
        toast.error(result.error ?? "Something went wrong placing your order.");
        return;
      }

      setPlacedOrderNumber(result.orderNumber);
      clear();
    } finally {
      setSubmitting(false);
    }
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
              By placing this order you agree to our shipping and return policies. This is a
              demonstration checkout — no payment will be processed.
            </p>
            <Button type="submit" variant="accent" size="lg" className="mt-5 w-full sm:w-auto" disabled={submitting}>
              {submitting ? "Placing Order..." : `Place Order — ${formatINR(total)}`}
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
