import { NextRequest, NextResponse } from "next/server";
import { syncFastrrOrder } from "@/lib/db/fastrr-sync";

// Fastrr's order webhook — registered with their team as this route's URL. Per their docs
// this isn't signed (no X-Api-Key/HMAC header, unlike their catalog webhooks), so the body
// itself is treated only as a trigger: syncFastrrOrder always re-fetches the authoritative
// order from Fastrr's own signed Order/Details API rather than trusting this payload
// directly. Also: "webhooks may be sent more than once" per the docs — syncFastrrOrder is
// idempotent on fastrrOrderId, so a retry is a harmless no-op.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderId = body?.order_id;

  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ received: true });
  }

  await syncFastrrOrder(orderId);
  return NextResponse.json({ received: true });
}
