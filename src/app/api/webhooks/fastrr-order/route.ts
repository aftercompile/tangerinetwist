import { NextRequest, NextResponse } from "next/server";
import { syncFastrrOrder } from "@/lib/db/fastrr-sync";

// Fastrr's order webhook. Their docs show no signature on this one (unlike their catalog
// webhooks, which do carry X-Api-Key + HMAC), but their webhook registration screen lets
// you attach arbitrary headers — so we register a shared secret there and check it here,
// exactly like the Shiprocket courier-tracking webhook already does.
//
// Enforced only when FASTRR_WEBHOOK_SECRET is set, so a missing/not-yet-registered secret
// degrades to "unauthenticated but still safe" rather than silently dropping every order:
// syncFastrrOrder never trusts this payload anyway — it only reads order_id from it and
// re-fetches the authoritative order over our own signed API call.
function checkSharedSecret(request: NextRequest): boolean {
  const secret = process.env.FASTRR_WEBHOOK_SECRET;
  if (!secret) return true;
  return request.headers.get("x-api-key") === secret;
}

export async function POST(request: NextRequest) {
  if (!checkSharedSecret(request)) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = body?.order_id;

  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ received: true });
  }

  // Idempotent on fastrrOrderId — Fastrr's docs warn webhooks may be delivered more than
  // once, so a retry is a harmless no-op.
  await syncFastrrOrder(orderId);
  return NextResponse.json({ received: true });
}
