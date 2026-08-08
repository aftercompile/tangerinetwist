"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth/guard";
import { getCurrentCustomer } from "@/lib/auth/customer-guard";
import { db } from "@/lib/db/index";
import { orderItems, orders, products } from "@/lib/db/schema";
import { calculateTotals } from "@/lib/orders";
import { placeOrderInputSchema, type PlaceOrderInput } from "@/lib/validation/order";
import { cancelShiprocketShipment } from "@/lib/actions/shiprocket-actions";
import { getRazorpayClient, verifyPaymentSignature, mapRazorpayMethod } from "@/lib/razorpay/client";

const ORDER_STATUSES = ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Shared by both checkout paths (COD and online) — never trust client-sent prices; cart
// lines are a denormalized localStorage snapshot that can go stale or be tampered with.
async function resolveOrderItems(items: PlaceOrderInput["items"]) {
  const slugs = items.map((i) => i.slug);
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)] },
      variants: { with: { images: { orderBy: (img, { asc }) => [asc(img.position)] } } },
    },
  });

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return { error: "Some items in your cart are no longer available." } as const;
  }

  const orderItemRows = items.map((item) => {
    const product = bySlug.get(item.slug)!;
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
    const primaryImage = variant?.images[0] ?? product.images[0];
    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      variantLabel: variant ? [variant.size, variant.color].filter(Boolean).join(" / ") : null,
      name: product.name,
      slug: product.slug,
      price: variant?.price ?? product.price,
      material: product.material,
      imageSrc: primaryImage?.src ?? null,
      imageIcon: primaryImage?.icon ?? product.icon,
      imageTone: primaryImage?.tone ?? "beige",
      quantity: item.quantity,
    };
  });

  const subtotal = orderItemRows.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { orderItemRows, subtotal } as const;
}

function generateOrderNumber(): string {
  return `TT-${new Date().toISOString().slice(2, 7).replace("-", "")}-${randomUUID().split("-")[0].toUpperCase()}`;
}

// Cash on Delivery only — nothing to verify, the order is placed directly exactly as it
// always has been. Online payment goes through createOrderForPayment instead.
export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ error?: string; orderNumber?: string }> {
  const parsed = placeOrderInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order details" };
  }
  const { shipping, items } = parsed.data;
  if (shipping.paymentMethod !== "cod") {
    return { error: "Use the online payment flow for this order." };
  }

  const resolved = await resolveOrderItems(items);
  if ("error" in resolved) return { error: resolved.error };
  const { orderItemRows, subtotal } = resolved;

  const { shipping: shippingCost, total } = calculateTotals(subtotal);
  const orderNumber = generateOrderNumber();

  // Derived from the verified session, never from client input — mirrors how prices
  // above are re-read from the DB rather than trusted from the request. Guests (no
  // session) simply get customerId: null, identical to today's behavior.
  const customer = await getCurrentCustomer();

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        status: "pending",
        customerId: customer?.id ?? null,
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        addressLine: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pin: shipping.pin,
        paymentMethod: "cod",
        paymentStatus: "cod",
        checkoutSource: "razorpay",
        subtotal,
        shipping: shippingCost,
        total,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(orderItemRows.map((item) => ({ ...item, orderId: order.id })));

    return order.id;
  });

  // /admin/orders and /admin are marked force-dynamic so the server always reruns
  // the query, but the client's Router Cache can still serve an already-visited
  // page from before this order existed — revalidatePath busts that too.
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return { orderNumber: orderId ? orderNumber : undefined };
}

// Attaches any guest orders placed under this email to the account that now owns it —
// called right after sign-up and sign-in, since a guest order's customerId is only ever
// set at checkout time from the session that existed then (which was none). Case-
// insensitive comparison via lower() on both sides, not ilike, since ilike treats "_" as
// a single-character wildcard and emails can legitimately contain underscores.
export async function claimGuestOrders(customerId: string, email: string): Promise<void> {
  await db
    .update(orders)
    .set({ customerId })
    .where(and(isNull(orders.customerId), sql`lower(${orders.customerEmail}) = lower(${email})`));

  revalidatePath("/account");
}

// Online payment: creates the Razorpay order first (nothing touches our DB if that call
// fails), then inserts our own order+items row referencing it with paymentStatus "pending"
// — so there's always a DB row to reconcile the payment against once it completes, whether
// confirmation arrives via verifyRazorpayPayment below or the /api/webhooks/razorpay route.
export async function createOrderForPayment(
  input: PlaceOrderInput
): Promise<{ error?: string; orderId?: string; razorpayOrderId?: string; amountPaise?: number; keyId?: string }> {
  const parsed = placeOrderInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order details" };
  }
  const { shipping, items } = parsed.data;
  if (shipping.paymentMethod !== "online") {
    return { error: "Use the Cash on Delivery flow for this order." };
  }

  const resolved = await resolveOrderItems(items);
  if ("error" in resolved) return { error: resolved.error };
  const { orderItemRows, subtotal } = resolved;

  const { shipping: shippingCost, total } = calculateTotals(subtotal);
  const orderNumber = generateOrderNumber();
  const amountPaise = total * 100;

  let razorpayOrderId: string;
  try {
    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: orderNumber,
      notes: { orderNumber },
    });
    razorpayOrderId = razorpayOrder.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to start payment" };
  }

  const customer = await getCurrentCustomer();

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        status: "pending",
        customerId: customer?.id ?? null,
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        addressLine: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pin: shipping.pin,
        paymentMethod: null,
        paymentStatus: "pending",
        razorpayOrderId,
        checkoutSource: "razorpay",
        subtotal,
        shipping: shippingCost,
        total,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(orderItemRows.map((item) => ({ ...item, orderId: order.id })));

    return order.id;
  });

  return { orderId, razorpayOrderId, amountPaise, keyId: process.env.RAZORPAY_KEY_ID };
}

// Verifies the client's payment claim after Razorpay Checkout's success callback — the
// signature is recomputed server-side (see verifyPaymentSignature) rather than trusted.
// Idempotent: safe to call even if the webhook already marked this order paid.
export async function verifyRazorpayPayment(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ error?: string; orderNumber?: string }> {
  const valid = verifyPaymentSignature(input);
  if (!valid) {
    return { error: "Payment verification failed." };
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId));
  if (!order || order.razorpayOrderId !== input.razorpayOrderId) {
    return { error: "Order not found." };
  }

  if (order.paymentStatus !== "paid") {
    let method: "card" | "upi" | "netbanking" | "wallet" | null = null;
    try {
      const razorpay = getRazorpayClient();
      const payment = await razorpay.payments.fetch(input.razorpayPaymentId);
      method = mapRazorpayMethod(payment.method);
    } catch {
      // Non-fatal — the payment is already verified either way; the granular method is
      // cosmetic detail for the admin order view, not something anything depends on.
    }

    await db
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: "confirmed",
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        paymentMethod: method,
      })
      .where(eq(orders.id, input.orderId));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${input.orderId}`);
    revalidatePath("/admin");
  }

  return { orderNumber: order.orderNumber };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ error?: string }> {
  await requireAdminSession();
  if (!ORDER_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  // Keep Shiprocket in sync rather than letting the two systems silently diverge — a
  // courier shipment left active after we've marked the order cancelled would still
  // get picked up. If the Shiprocket cancel call fails, the status change is blocked
  // too, so the admin retries rather than ending up with a cancelled order and a
  // live shipment.
  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (status === "cancelled" && existing?.shiprocketOrderId) {
    const result = await cancelShiprocketShipment(existing.shiprocketOrderId);
    if (result.error) {
      return { error: `Order status not changed — Shiprocket cancellation failed: ${result.error}` };
    }
  }

  await db.update(orders).set({ status }).where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");

  return {};
}
