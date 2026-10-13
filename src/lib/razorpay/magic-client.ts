// Browser-side driver for Razorpay Magic Checkout, shared by the /checkout panel (whole
// cart) and the product page's Buy Now button (one product, cart untouched). Starts a
// server-side session, opens Razorpay's modal, and resolves once the customer is done.
import { createMagicCheckout, confirmMagicCheckout } from "@/lib/actions/magic-checkout-actions";

export interface MagicItem {
  slug: string;
  quantity: number;
  variantId?: string;
}

export type MagicOutcome =
  | { kind: "confirmed"; orderNumber: string }
  // Paid and signature-verified, but our order row isn't visible yet — the webhook will
  // record it moments later.
  | { kind: "pending" }
  // Closed the window without paying; nothing to clean up (an unused session at most).
  | { kind: "dismissed" }
  | { kind: "error"; message: string };

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void };

// Magic Checkout ships as its own script (not checkout.js) — a hosted file, not an npm
// package, so it's loaded once on demand and reused.
function loadMagicScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (document.querySelector("script[data-magic-checkout]")) {
      return resolve(Boolean((window as unknown as { Razorpay?: unknown }).Razorpay));
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/magic-checkout.js";
    script.dataset.magicCheckout = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function runMagicCheckout(
  items: MagicItem[],
  fallbackPrefill?: { name?: string; email?: string }
): Promise<MagicOutcome> {
  let created: Awaited<ReturnType<typeof createMagicCheckout>>;
  try {
    created = await createMagicCheckout(items);
  } catch {
    // Network drop etc. — the caller's button must never be left stuck on "Opening…".
    return { kind: "error", message: "Couldn't reach checkout. Check your connection and try again." };
  }
  if (created.error || !created.razorpayOrderId || !created.keyId) {
    return { kind: "error", message: created.error ?? "Could not start checkout." };
  }

  const loaded = await loadMagicScript();
  const Razorpay = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
  if (!loaded || !Razorpay) {
    return {
      kind: "error",
      message: "Could not load the checkout window. Check your connection and try again.",
    };
  }

  return new Promise<MagicOutcome>((resolve) => {
    const rzp = new Razorpay({
      key: created.keyId,
      one_click_checkout: true,
      name: "TangerineTwist",
      order_id: created.razorpayOrderId,
      show_coupons: true,
      prefill: created.prefill ?? fallbackPrefill,
      theme: { color: "#E86A2C" },
      handler: async (response: RazorpaySuccess) => {
        let confirmed: Awaited<ReturnType<typeof confirmMagicCheckout>>;
        try {
          confirmed = await confirmMagicCheckout({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        } catch {
          // They've paid; only our confirmation call failed. Razorpay's webhook still
          // records the order, so say that rather than implying the payment failed.
          resolve({ kind: "pending" });
          return;
        }
        if (confirmed.error) {
          resolve({
            kind: "error",
            message: `${confirmed.error} If you were charged, contact us with your payment details.`,
          });
        } else if (confirmed.orderNumber) {
          resolve({ kind: "confirmed", orderNumber: confirmed.orderNumber });
        } else {
          resolve({ kind: "pending" });
        }
      },
      modal: { ondismiss: () => resolve({ kind: "dismissed" }) },
    });
    rzp.open();
  });
}
