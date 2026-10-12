import { NextRequest, NextResponse } from "next/server";
import { getValidCoupon } from "@/lib/actions/coupon-actions";
import { readCallbackPayload, sessionFromPayload } from "@/lib/razorpay/magic-callbacks";

export const dynamic = "force-dynamic";

// getValidCoupon reports problems as customer-facing sentences; Razorpay wants a code.
// Only the minimum-order case is distinguishable and actionable ("add more items") — every
// other failure is just "this code won't work".
function failureCode(message: string): "REQUIREMENT_NOT_MET" | "INVALID_PROMOTION" {
  return /minimum order/i.test(message) ? "REQUIREMENT_NOT_MET" : "INVALID_PROMOTION";
}

// Razorpay Magic Checkout's "URL for apply promotions". Validates the code against the
// cart *we* stored (not anything in the request), with the same rules as our own checkout.
// Read-only: the coupon is only consumed once the order is actually paid (see
// finalizeMagicOrder), so a customer trying codes can't burn usage.
async function handle(request: NextRequest) {
  const payload = await readCallbackPayload(request);
  const session = await sessionFromPayload(payload);
  if (!session) {
    return NextResponse.json({ failure_code: "INVALID_PROMOTION", failure_reason: "Unknown order" }, { status: 404 });
  }

  const code = typeof payload.code === "string" ? payload.code : "";
  // "Once per customer" is tracked by email; Razorpay's email is optional but the phone
  // number always exists, so it stands in as the identity when there's no email.
  const identity = String(payload.email || payload.contact || "");

  const result = await getValidCoupon(code, session.subtotal, identity);
  if ("error" in result) {
    return NextResponse.json(
      { failure_code: failureCode(result.error), failure_reason: result.error },
      { status: 400 }
    );
  }

  const { coupon, discountAmount } = result;
  return NextResponse.json({
    promotion: {
      reference_id: coupon.id,
      type: "coupon",
      code: coupon.code,
      // Always paise, and always the concrete amount for this cart — including for
      // percentage coupons, so there's no ambiguity about what `value` means.
      value: discountAmount * 100,
      value_type: "fixed_amount",
      description: coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`,
    },
  });
}

export { handle as GET, handle as POST };
