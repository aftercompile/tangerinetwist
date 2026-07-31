import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

function getKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — copy .env.example to .env.local and fill it in."
    );
  }
  return { keyId, keySecret };
}

// Cached on globalThis the same way the Postgres client is in src/lib/db/index.ts — the
// SDK instance itself holds no connection to leak, just avoids re-constructing it per call.
const globalForRazorpay = globalThis as unknown as { razorpayClient?: Razorpay };

export function getRazorpayClient(): Razorpay {
  if (globalForRazorpay.razorpayClient) return globalForRazorpay.razorpayClient;
  const { keyId, keySecret } = getKeys();
  const client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  globalForRazorpay.razorpayClient = client;
  return client;
}

// Verifies the client-reported payment claim after Razorpay Checkout succeeds — this is
// the "never trust the client" boundary for payments, the same principle already applied
// to cart prices and customerId elsewhere in this app. Only a signature that matches what
// we recompute server-side (using the secret key, never exposed to the client) is trusted.
export function verifyPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getKeys();
  const expected = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(razorpaySignature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

// Webhook signature verification uses a *different* secret than the checkout signature
// above (RAZORPAY_WEBHOOK_SECRET, configured separately in the Razorpay dashboard) — the
// SDK ships this check as a static helper, no need to hand-roll it.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not set — copy .env.example to .env.local and fill it in.");
  }
  return Razorpay.validateWebhookSignature(rawBody, signature, secret);
}

// Razorpay reports finer-grained methods (emi, upi, card, netbanking, wallet, ...) than our
// paymentMethodEnum covers — unrecognized ones just leave paymentMethod null rather than
// widening the enum further; it's cosmetic detail, not something anything depends on.
export function mapRazorpayMethod(method: string | undefined): "card" | "upi" | "netbanking" | "wallet" | null {
  if (method === "card" || method === "upi" || method === "netbanking" || method === "wallet") return method;
  return null;
}
