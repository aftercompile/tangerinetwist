"use client";

import { toast } from "sonner";
import { createFastrrCheckoutToken } from "@/lib/actions/fastrr-checkout-actions";

const JS_URL = "https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js";
const CSS_URL = "https://checkout-ui.shiprocket.com/assets/styles/shopify.css";

declare global {
  interface Window {
    HeadlessCheckout?: {
      addToCart: (
        event: Event,
        token: string,
        options?: { fallbackUrl?: string; isInitiatedFromApp?: boolean }
      ) => void;
    };
  }
}

let scriptPromise: Promise<boolean> | null = null;

// Fastrr's checkout overlay is a hosted script, not an npm package — same pattern as
// Razorpay Checkout before it (see the old loadRazorpayScript this replaces): load it
// once and reuse across every "Checkout"/"Buy Now" entry point on the site.
function loadFastrrScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.HeadlessCheckout) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_URL;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = JS_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return scriptPromise;
}

// Shared by the cart drawer, the cart page, and product-page "Buy Now" — generates a
// checkout token for the given cart lines (never trusts client-sent prices; see
// createFastrrCheckoutToken) and opens Fastrr's hosted checkout overlay right on the
// current page. The overlay itself handles address, shipping and payment (including
// COD) end-to-end, then redirects to /checkout with the result.
export async function openFastrrCheckout(
  event: React.MouseEvent,
  items: { slug: string; quantity: number }[]
): Promise<void> {
  const result = await createFastrrCheckoutToken(items);
  if (result.error || !result.token) {
    toast.error(result.error ?? "Could not start checkout.");
    return;
  }

  const loaded = await loadFastrrScript();
  if (!loaded || !window.HeadlessCheckout) {
    toast.error("Could not load checkout. Check your connection and try again.");
    return;
  }

  window.HeadlessCheckout.addToCart(event.nativeEvent, result.token, {
    fallbackUrl: `${window.location.origin}/cart`,
  });
}
