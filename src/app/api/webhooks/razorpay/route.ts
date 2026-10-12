import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { verifyWebhookSignature, mapRazorpayMethod } from "@/lib/razorpay/client";
import { finalizeMagicOrder, getMagicSessionByRazorpayOrderId } from "@/lib/razorpay/magic-checkout";

// Events that mean "money has moved or COD was placed" on a Magic Checkout order.
const MAGIC_COMPLETION_EVENTS = new Set(["order.paid", "order.placed", "payment.captured", "payment.pending"]);

// The authoritative payment-confirmation path — catches a payment whose client-side
// verifyRazorpayPayment call never arrives (closed tab, dropped connection right after
// paying). Must read the raw body (not request.json()) since the signature is computed
// over the exact bytes Razorpay sent, before any parsing.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const paymentEntity = event?.payload?.payment?.entity;

  // Magic Checkout orders have no row in `orders` until payment completes (the address is
  // collected inside Razorpay's modal), so they're recognised by their stored session and
  // finalized here — the same idempotent path the browser callback uses.
  const razorpayOrderId: string | undefined = event?.payload?.order?.entity?.id ?? paymentEntity?.order_id;
  if (razorpayOrderId && (await getMagicSessionByRazorpayOrderId(razorpayOrderId))) {
    if (MAGIC_COMPLETION_EVENTS.has(event.event)) {
      const result = await finalizeMagicOrder(razorpayOrderId);
      // A real failure (Razorpay API down, DB error) gets a 500 so Razorpay retries the
      // webhook; "incomplete" is just an event that isn't a completion yet.
      if (result.status === "error") {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
    return NextResponse.json({ received: true });
  }

  if (!paymentEntity?.order_id) {
    return NextResponse.json({ received: true });
  }

  const [order] = await db.select().from(orders).where(eq(orders.razorpayOrderId, paymentEntity.order_id));
  if (!order) {
    return NextResponse.json({ received: true });
  }

  // Idempotent — safe even if verifyRazorpayPayment already applied this.
  if (event.event === "payment.captured" && order.paymentStatus !== "paid") {
    await db
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: "confirmed",
        razorpayPaymentId: paymentEntity.id,
        paymentMethod: mapRazorpayMethod(paymentEntity.method),
      })
      .where(eq(orders.id, order.id));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath("/admin");
  } else if (event.event === "payment.failed" && order.paymentStatus === "pending") {
    await db.update(orders).set({ paymentStatus: "failed" }).where(eq(orders.id, order.id));
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);
  }

  return NextResponse.json({ received: true });
}
