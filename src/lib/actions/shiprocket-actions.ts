"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { orderItems, orderTrackingEvents, orders } from "@/lib/db/schema";
import { shiprocketFetch, getPickupLocation, buildTrackingUrl } from "@/lib/shiprocket/client";
import type {
  CreateOrderResponse,
  AssignAwbResponse,
  TrackingResponse,
  ShiprocketTrackingActivity,
  LabelResponse,
  InvoiceResponse,
} from "@/lib/shiprocket/types";

function isDeliveredStatus(status: string): boolean {
  return /delivered/i.test(status);
}

// Shared by the manual "Refresh tracking" button and the /api/webhooks/courier-tracking
// route, so both paths apply identical replace-all-events + status-sync logic and
// can't drift apart. Shiprocket's response is treated as the complete current history
// for the shipment, not a delta — existing events for this order are wiped and
// replaced with whatever it reports now.
export async function applyTrackingUpdate(
  orderId: string,
  activities: ShiprocketTrackingActivity[],
  latestStatus: string,
  source: "webhook" | "manual_refresh"
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(orderTrackingEvents).where(eq(orderTrackingEvents.orderId, orderId));

    if (activities.length > 0) {
      await tx.insert(orderTrackingEvents).values(
        activities.map((a) => ({
          orderId,
          status: a.status || a.activity || "Update",
          activity: a.activity ?? null,
          location: a.location ?? null,
          occurredAt: a.date ? new Date(a.date) : new Date(),
          source,
        }))
      );
    }

    // Closes the loop between courier status and our own fulfillment status — today
    // orders.status otherwise only ever moves via manual admin action.
    await tx
      .update(orders)
      .set({
        shiprocketStatus: latestStatus,
        ...(isDeliveredStatus(latestStatus) ? { status: "delivered" as const } : {}),
      })
      .where(eq(orders.id, orderId));
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
}

interface PackageDetails {
  weight: number;
  length: number;
  breadth: number;
  height: number;
}

export async function shipOrderViaShiprocket(orderId: string, pkg: PackageDetails): Promise<{ error?: string }> {
  await requireAdminSession();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return { error: "Order not found" };
  if (order.shiprocketOrderId) return { error: "This order has already been shipped via Shiprocket." };
  if (!order.state) {
    return {
      error: "This order has no state on file — Shiprocket requires one to create a shipment.",
    };
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  try {
    const created = await shiprocketFetch<CreateOrderResponse>("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.orderNumber,
        order_date: order.createdAt.toISOString().slice(0, 16).replace("T", " "),
        pickup_location: getPickupLocation(),
        billing_customer_name: order.customerName,
        billing_last_name: "",
        billing_address: order.addressLine,
        billing_city: order.city,
        billing_pincode: order.pin,
        billing_state: order.state,
        billing_country: "India",
        billing_email: order.customerEmail,
        billing_phone: order.customerPhone,
        shipping_is_billing: true,
        order_items: items.map((item) => ({
          name: item.name,
          sku: item.slug,
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
        sub_total: order.subtotal,
        length: pkg.length,
        breadth: pkg.breadth,
        height: pkg.height,
        weight: pkg.weight,
      }),
    });

    // Omitting courier_id auto-assigns Shiprocket's recommended (cheapest) courier —
    // the one-click flow this was scoped for, no separate rate/courier picker screen.
    const assigned = await shiprocketFetch<AssignAwbResponse>("/courier/assign/awb", {
      method: "POST",
      body: JSON.stringify({ shipment_id: created.shipment_id }),
    });
    const awb = assigned.response.data;

    // Best-effort: a failure here shouldn't undo the shipment that already succeeded
    // above. The admin panel falls back to generating (and persisting) it on demand
    // if invoiceUrl ends up null.
    let invoiceUrl: string | null = null;
    try {
      const invoice = await shiprocketFetch<InvoiceResponse>("/orders/print/invoice", {
        method: "POST",
        body: JSON.stringify({ ids: [created.order_id] }),
      });
      invoiceUrl = invoice.invoice_url;
    } catch {
      // Non-fatal — see comment above.
    }

    await db
      .update(orders)
      .set({
        shiprocketOrderId: String(created.order_id),
        shiprocketShipmentId: String(created.shipment_id),
        awbCode: awb.awb_code,
        courierName: awb.courier_name,
        trackingUrl: buildTrackingUrl(awb.awb_code),
        shiprocketStatus: "AWB Assigned",
        invoiceUrl,
      })
      .where(eq(orders.id, orderId));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to ship via Shiprocket" };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}

export async function refreshShiprocketTracking(orderId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order?.awbCode) return { error: "This order hasn't been shipped via Shiprocket yet." };

  try {
    const tracking = await shiprocketFetch<TrackingResponse>(`/courier/track/awb/${order.awbCode}`);
    const activities = tracking.tracking_data.shipment_track_activities ?? [];
    const latest =
      activities[0]?.status ||
      activities[0]?.activity ||
      tracking.tracking_data.shipment_track?.[0]?.current_status ||
      "Unknown";
    await applyTrackingUpdate(orderId, activities, latest, "manual_refresh");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to refresh tracking" };
  }

  return {};
}

export async function getShiprocketLabelUrl(orderId: string): Promise<{ url?: string; error?: string }> {
  await requireAdminSession();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order?.shiprocketShipmentId) return { error: "This order hasn't been shipped via Shiprocket yet." };

  try {
    const label = await shiprocketFetch<LabelResponse>("/courier/generate/label", {
      method: "POST",
      body: JSON.stringify({ shipment_id: [Number(order.shiprocketShipmentId)] }),
    });
    return { url: label.label_url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate label" };
  }
}

// Fallback path for the rare case shipOrderViaShiprocket's own invoice generation
// failed — persists the result the same way so it doesn't need regenerating again
// next time.
export async function getShiprocketInvoiceUrl(orderId: string): Promise<{ url?: string; error?: string }> {
  await requireAdminSession();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order?.shiprocketOrderId) return { error: "This order hasn't been shipped via Shiprocket yet." };
  if (order.invoiceUrl) return { url: order.invoiceUrl };

  try {
    const invoice = await shiprocketFetch<InvoiceResponse>("/orders/print/invoice", {
      method: "POST",
      body: JSON.stringify({ ids: [Number(order.shiprocketOrderId)] }),
    });
    await db.update(orders).set({ invoiceUrl: invoice.invoice_url }).where(eq(orders.id, orderId));
    return { url: invoice.invoice_url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate invoice" };
  }
}

// Called both directly as an admin action and internally from updateOrderStatus
// (order-actions.ts) when an order with a live shipment is marked cancelled — verifies
// its own session either way, matching this repo's defense-in-depth convention for
// every exported server action.
export async function cancelShiprocketShipment(shiprocketOrderId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  try {
    await shiprocketFetch("/orders/cancel", {
      method: "POST",
      body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
    });
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to cancel Shiprocket shipment" };
  }
}
