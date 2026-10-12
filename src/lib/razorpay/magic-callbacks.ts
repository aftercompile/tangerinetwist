import type { NextRequest } from "next/server";
import { getMagicSessionByRazorpayOrderId, getMagicSessionByToken } from "@/lib/razorpay/magic-checkout";

// Razorpay's docs describe these three callbacks as GET but show JSON request bodies, so
// each route accepts both methods and reads the payload from the body when there is one,
// falling back to the query string. (The first real call from Razorpay settles which it is.)
export async function readCallbackPayload(request: NextRequest): Promise<Record<string, unknown>> {
  let payload: Record<string, unknown> | null = null;
  try {
    const text = await request.text();
    if (text.trim()) {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) payload = parsed as Record<string, unknown>;
    }
  } catch {
    // fall through to query params
  }
  payload ??= Object.fromEntries(request.nextUrl.searchParams.entries());

  // If a callback arrives with no order id at all, the most likely cause is a request
  // shape we didn't expect (e.g. a GET carrying a JSON body, which Next.js drops). Log the
  // shape — method and field *names*, never values — so the first real call from Razorpay
  // tells us exactly what to adjust.
  if (!payload.order_id && !payload.razorpay_order_id) {
    console.warn("[magic-callback] request without an order id", {
      path: request.nextUrl.pathname,
      method: request.method,
      contentLength: request.headers.get("content-length"),
      contentType: request.headers.get("content-type"),
      fields: Object.keys(payload),
    });
  }
  return payload;
}

// These endpoints are unauthenticated by Razorpay's design, so the session token (our
// Razorpay order's `receipt`, unguessable) is what gates them: no valid token, no data.
export async function sessionFromPayload(payload: Record<string, unknown>) {
  const token = typeof payload.order_id === "string" ? payload.order_id : "";
  const byToken = await getMagicSessionByToken(token);
  if (byToken) return byToken;
  const rzId = typeof payload.razorpay_order_id === "string" ? payload.razorpay_order_id : "";
  return rzId ? getMagicSessionByRazorpayOrderId(rzId) : null;
}
