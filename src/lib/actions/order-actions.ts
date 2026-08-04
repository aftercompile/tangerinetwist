"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema";
import { cancelShiprocketShipment } from "@/lib/actions/shiprocket-actions";

const ORDER_STATUSES = ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

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
