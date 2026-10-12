import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import {
  coupons,
  couponRedemptions,
  magicCheckoutSessions,
  orderItems,
  orders,
  type MagicSessionItem,
} from "@/lib/db/schema";
import { generateOrderNumber } from "@/lib/orders";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { extractMagicOrderDetails, type MagicOrderDetails } from "@/lib/razorpay/magic-order";

export async function getMagicSessionByToken(token: string) {
  if (!token) return null;
  const [row] = await db.select().from(magicCheckoutSessions).where(eq(magicCheckoutSessions.token, token));
  return row ?? null;
}

// Razorpay's shipping callback sends the order id without its "order_" prefix.
export async function getMagicSessionByRazorpayOrderId(razorpayOrderId: string) {
  if (!razorpayOrderId) return null;
  const id = razorpayOrderId.startsWith("order_") ? razorpayOrderId : `order_${razorpayOrderId}`;
  const [row] = await db.select().from(magicCheckoutSessions).where(eq(magicCheckoutSessions.razorpayOrderId, id));
  return row ?? null;
}

export async function createMagicSession(values: {
  token: string;
  razorpayOrderId: string;
  customerId: string | null;
  items: MagicSessionItem[];
  subtotal: number;
}) {
  await db.insert(magicCheckoutSessions).values(values);
}

export type FinalizeResult =
  | { status: "done"; orderNumber: string; orderId: string; created: boolean }
  | { status: "incomplete" }
  | { status: "error"; error: string };

/**
 * Turns a completed Magic Checkout into a row in our `orders` table. Called from both the
 * browser's success callback (confirmMagicCheckout) and Razorpay's webhook, whichever
 * arrives first — the second is a no-op because the session row is locked and its `orderId`
 * is re-checked inside the transaction.
 *
 * Never trusts the trigger: it only takes a Razorpay order id and re-fetches the order and
 * its payments over our own authenticated API call, so a forged webhook body or callback
 * can't mint an order. The cart itself comes from our stored session (prices read from the
 * database when the checkout started), not from anything Razorpay or the browser sends.
 */
export async function finalizeMagicOrder(razorpayOrderId: string): Promise<FinalizeResult> {
  const session = await getMagicSessionByRazorpayOrderId(razorpayOrderId);
  if (!session) return { status: "error", error: "Unknown checkout session." };

  if (session.orderId) {
    const [existing] = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.id, session.orderId));
    if (existing) return { status: "done", orderNumber: existing.orderNumber, orderId: session.orderId, created: false };
  }

  let rzOrder: unknown;
  let rzPayments: unknown[];
  try {
    const razorpay = getRazorpayClient();
    rzOrder = await razorpay.orders.fetch(session.razorpayOrderId!);
    rzPayments = (await razorpay.orders.fetchPayments(session.razorpayOrderId!)).items ?? [];
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Could not fetch the Razorpay order." };
  }

  const d = extractMagicOrderDetails(rzOrder, rzPayments);
  if (d.kind === "incomplete") return { status: "incomplete" };

  // Structure only, never values — customer details must not land in logs. Razorpay's docs
  // don't spell out the address sub-fields, so if any of ours come back empty this is the
  // line that tells us what the real shape is.
  if (d.missing.length > 0) {
    const details = (rzOrder as { customer_details?: Record<string, unknown> }).customer_details ?? {};
    const addr = (details.shipping_address ?? details.billing_address ?? {}) as Record<string, unknown>;
    console.error("[magic-checkout] fields missing from fetched order", {
      razorpayOrderId: session.razorpayOrderId,
      missing: d.missing,
      customerDetailsKeys: Object.keys(details),
      addressKeys: Object.keys(addr),
    });
  }

  const result = await recordMagicOrder(session, d);
  if (result.status === "done" && result.created) {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${result.orderId}`);
    revalidatePath("/admin");
  }
  return result;
}

/**
 * The database half of finalizing: given a session and the normalized details of a completed
 * Razorpay order, create our order exactly once. Split out from finalizeMagicOrder so it can
 * be exercised without calling Razorpay.
 */
export async function recordMagicOrder(
  session: typeof magicCheckoutSessions.$inferSelect,
  d: MagicOrderDetails
): Promise<FinalizeResult> {
  const razorpayOrderId = session.razorpayOrderId ?? "";

  // Record what was actually charged, but keep `total = subtotal - discount + shipping`
  // true for every order row. A mismatch with what we expected means Razorpay's fee/discount
  // differ from what our callbacks quoted — worth knowing, so it's logged.
  const expected = session.subtotal - d.discount + d.shipping;
  const total = d.total > 0 ? d.total : expected;
  const shipping = Math.max(0, total - session.subtotal + d.discount);
  if (total !== expected) {
    console.error("[magic-checkout] charged amount differs from expected", {
      razorpayOrderId,
      expected,
      charged: total,
    });
  }

  const placeholder = "—";
  const pending = d.missing.length > 0 ? ` (incomplete — see Razorpay order ${razorpayOrderId})` : "";
  const customerKey = (d.customer.email || d.customer.phone).trim().toLowerCase();

  const outcome = await db.transaction(async (tx) => {
    // Lock + re-check: the webhook and the browser callback can land together.
    const [locked] = await tx
      .select()
      .from(magicCheckoutSessions)
      .where(eq(magicCheckoutSessions.token, session.token))
      .for("update");
    if (locked.orderId) return { orderId: locked.orderId, created: false };

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        status: "confirmed",
        customerId: session.customerId,
        customerName: d.customer.name || placeholder,
        customerEmail: d.customer.email || placeholder,
        customerPhone: d.customer.phone || placeholder,
        addressLine: (d.address.line || "Address not captured") + pending,
        city: d.address.city || placeholder,
        state: d.address.state || null,
        pin: d.address.pin || placeholder,
        paymentMethod: d.method,
        paymentStatus: d.kind === "cod" ? "cod" : "paid",
        razorpayOrderId: session.razorpayOrderId,
        razorpayPaymentId: d.paymentId,
        checkoutSource: "razorpay_magic",
        subtotal: session.subtotal,
        couponCode: d.couponCode,
        discountAmount: d.discount,
        shipping,
        total,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(session.items.map((item) => ({ ...item, orderId: order.id })));

    // Razorpay already applied the discount (it called our apply-promotion endpoint), so
    // there's nothing to refuse here — just consume the coupon so usage limits stay true.
    if (d.couponCode) {
      const [coupon] = await tx.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, d.couponCode.toUpperCase()));
      if (coupon) {
        await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, coupon.id));
        await tx.insert(couponRedemptions).values({ couponId: coupon.id, orderId: order.id, customerEmail: customerKey });
      }
    }

    await tx.update(magicCheckoutSessions).set({ orderId: order.id }).where(eq(magicCheckoutSessions.token, session.token));
    return { orderId: order.id, created: true };
  });

  const [row] = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.id, outcome.orderId));
  return { status: "done", orderNumber: row.orderNumber, orderId: outcome.orderId, created: outcome.created };
}
