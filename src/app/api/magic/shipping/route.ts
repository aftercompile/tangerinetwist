import { NextRequest, NextResponse } from "next/server";
import { readCallbackPayload, sessionFromPayload } from "@/lib/razorpay/magic-callbacks";
import { shippingMethodsFor, type ShippingRequestAddress } from "@/lib/razorpay/magic-order";

export const dynamic = "force-dynamic";

// Razorpay Magic Checkout's "URL for shipping info". Called each time the customer picks or
// enters an address, to learn whether we deliver there and what it costs. Returns fees only —
// no personal data — and prices from our stored session, never from the request.
async function handle(request: NextRequest) {
  const payload = await readCallbackPayload(request);
  const session = await sessionFromPayload(payload);
  if (!session) return NextResponse.json({ error: "Unknown order" }, { status: 404 });

  const addresses = Array.isArray(payload.addresses) ? (payload.addresses as ShippingRequestAddress[]) : [];
  return NextResponse.json({ addresses: addresses.map((a) => shippingMethodsFor(session.subtotal, a)) });
}

export { handle as GET, handle as POST };
