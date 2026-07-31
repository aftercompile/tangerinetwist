import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { applyTrackingUpdate } from "@/lib/actions/shiprocket-actions";
import type { ShiprocketTrackingActivity } from "@/lib/shiprocket/types";

// The authoritative "live" tracking path — Shiprocket calls this on shipment status
// change instead of us having to poll. Unlike Razorpay, Shiprocket doesn't sign the
// body with an HMAC we can independently recompute — it just echoes back a shared
// secret, so this checks that value directly rather than verifying a signature.
//
// KNOWN UNCERTAINTY: the exact header name Shiprocket sends the secret in, and the
// exact field names in the tracking payload, aren't confirmed against a real payload
// yet — checked defensively across a couple of plausible shapes below. If this stops
// matching (fields come back undefined), log the raw body once and adjust the field
// names here; the architecture (verify secret -> find order by AWB -> replace tracking
// events) won't need to change.
function checkSharedSecret(request: NextRequest, body: Record<string, unknown>): boolean {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) return false;

  const headerValue = request.headers.get("x-api-key") ?? request.headers.get("x-webhook-secret");
  if (headerValue === secret) return true;

  const bodyToken = body?.token ?? body?.secret;
  return bodyToken === secret;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !checkSharedSecret(request, body)) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const awbCode = body.awb ?? body.awb_code;
  if (!awbCode) {
    return NextResponse.json({ received: true });
  }

  const [order] = await db.select().from(orders).where(eq(orders.awbCode, String(awbCode)));
  if (!order) {
    return NextResponse.json({ received: true });
  }

  const rawActivities: unknown[] = body.scans ?? body.shipment_track_activities ?? [];
  const activities: ShiprocketTrackingActivity[] = rawActivities.map((a) => {
    const entry = a as Record<string, unknown>;
    return {
      date: (entry.date as string) ?? undefined,
      status: (entry.status as string) ?? undefined,
      activity: (entry.activity as string) ?? undefined,
      location: (entry.location as string) ?? undefined,
    };
  });

  const latest =
    activities[0]?.status || activities[0]?.activity || (body.current_status as string) || "Unknown";

  await applyTrackingUpdate(order.id, activities, latest, "webhook");

  return NextResponse.json({ received: true });
}
