import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { applyTrackingUpdate } from "@/lib/actions/shiprocket-actions";
import type { ShiprocketTrackingActivity } from "@/lib/shiprocket/types";

// The authoritative "live" tracking path — Shiprocket calls this on shipment status
// change instead of us having to poll. Confirmed against the dashboard's "Configure
// Webhook" screen (Settings > API > Webhooks): the secret is sent in a single HTTP
// header chosen via an "Auth Token Type" dropdown at registration time — there's no
// HMAC signature to independently recompute like Razorpay's, and no secret embedded in
// the body either. This app's setup instructions say to leave that dropdown on its
// default, "x-api-key", so that's the only header checked here.
function checkSharedSecret(request: NextRequest): boolean {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) return false;
  return request.headers.get("x-api-key") === secret;
}

export async function POST(request: NextRequest) {
  if (!checkSharedSecret(request)) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.awb) {
    return NextResponse.json({ received: true });
  }

  const [order] = await db.select().from(orders).where(eq(orders.awbCode, String(body.awb)));
  if (!order) {
    return NextResponse.json({ received: true });
  }

  // Confirmed shape: checkpoints are under `scans`, each { date, activity, location } —
  // no per-checkpoint `status` field, only the top-level `current_status`.
  const rawScans: unknown[] = Array.isArray(body.scans) ? body.scans : [];
  const activities: ShiprocketTrackingActivity[] = rawScans.map((s) => {
    const entry = s as Record<string, unknown>;
    return {
      date: (entry.date as string) ?? undefined,
      activity: (entry.activity as string) ?? undefined,
      location: (entry.location as string) ?? undefined,
    };
  });

  const latest = (body.current_status as string) || activities[0]?.activity || "Unknown";

  await applyTrackingUpdate(order.id, activities, latest, "webhook");

  return NextResponse.json({ received: true });
}
