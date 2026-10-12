import { NextRequest, NextResponse } from "next/server";
import { readCallbackPayload, sessionFromPayload } from "@/lib/razorpay/magic-callbacks";

export const dynamic = "force-dynamic";

// Razorpay Magic Checkout's "URL for get promotions": the coupons to *suggest* in the
// modal. Deliberately empty. Our coupons table has no public/private flag, so listing every
// active code here would broadcast codes that were only ever meant for specific people
// (influencers, win-back emails…). Customers type a code instead, which goes through the
// apply endpoint. When there's a "show at checkout" flag on coupons, list those here.
async function handle(request: NextRequest) {
  const payload = await readCallbackPayload(request);
  const session = await sessionFromPayload(payload);
  if (!session) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
  return NextResponse.json({ promotions: [] });
}

export { handle as GET, handle as POST };
