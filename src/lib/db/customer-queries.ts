import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { customerAddresses, orderItems, orderTrackingEvents, orders, productReviews } from "./schema";
import type { OrderTrackingEvent } from "@/lib/shiprocket/types";

// Account-dashboard reads are uncached (always live), same reasoning as admin-queries.ts —
// a customer must always see their own latest order status/addresses, not a stale cache.

export interface CustomerOrderRow {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "in_production" | "shipped" | "delivered" | "cancelled";
  total: number;
  itemCount: number;
  createdAt: Date;
}

export async function getCustomerOrders(customerId: string): Promise<CustomerOrderRow[]> {
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.customerId, customerId))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));

  return rows.map((r) => ({ ...r, itemCount: Number(r.itemCount) }));
}

export interface CustomerOrderDetail {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "in_production" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "cod";
  addressLine: string;
  city: string;
  state: string | null;
  pin: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: Date;
  courierName: string | null;
  trackingUrl: string | null;
  shiprocketStatus: string | null;
  shiprocketOrderId: string | null;
  invoiceUrl: string | null;
  trackingEvents: OrderTrackingEvent[];
  items: {
    id: string;
    productId: string | null;
    name: string;
    slug: string;
    price: number;
    material: string;
    imageSrc: string | null;
    imageIcon: string;
    imageTone: "warm" | "cool" | "charcoal" | "beige";
    quantity: number;
    reviewed: boolean;
  }[];
}

// Scoped by customerId, not just the order id — a customer must never be able to view
// another customer's order by guessing/incrementing an id in the URL. Returns undefined
// for both "doesn't exist" and "exists but isn't yours", identical 404 either way.
export async function getCustomerOrderById(customerId: string, orderId: string): Promise<CustomerOrderDetail | undefined> {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.customerId, customerId)));
  if (!order) return undefined;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  const reviewedProductIds = new Set<string>();
  if (order.status === "delivered") {
    const productIds = items.map((i) => i.productId).filter((id): id is string => id !== null);
    if (productIds.length > 0) {
      const reviewed = await db
        .select({ productId: productReviews.productId })
        .from(productReviews)
        .where(and(eq(productReviews.customerId, customerId), inArray(productReviews.productId, productIds)));
      reviewed.forEach((r) => reviewedProductIds.add(r.productId));
    }
  }

  const trackingEvents = await db
    .select({
      status: orderTrackingEvents.status,
      activity: orderTrackingEvents.activity,
      location: orderTrackingEvents.location,
      occurredAt: orderTrackingEvents.occurredAt,
    })
    .from(orderTrackingEvents)
    .where(eq(orderTrackingEvents.orderId, order.id))
    .orderBy(desc(orderTrackingEvents.occurredAt));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    addressLine: order.addressLine,
    city: order.city,
    state: order.state,
    pin: order.pin,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    createdAt: order.createdAt,
    courierName: order.courierName,
    trackingUrl: order.trackingUrl,
    shiprocketStatus: order.shiprocketStatus,
    shiprocketOrderId: order.shiprocketOrderId,
    invoiceUrl: order.invoiceUrl,
    trackingEvents,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      slug: i.slug,
      price: i.price,
      material: i.material,
      imageSrc: i.imageSrc,
      imageIcon: i.imageIcon,
      imageTone: i.imageTone,
      quantity: i.quantity,
      reviewed: i.productId !== null && reviewedProductIds.has(i.productId),
    })),
  };
}

export interface CustomerAddressRow {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string | null;
  pin: string;
  isDefault: boolean;
}

export async function getCustomerAddresses(customerId: string): Promise<CustomerAddressRow[]> {
  return db
    .select({
      id: customerAddresses.id,
      label: customerAddresses.label,
      fullName: customerAddresses.fullName,
      phone: customerAddresses.phone,
      addressLine: customerAddresses.addressLine,
      city: customerAddresses.city,
      state: customerAddresses.state,
      pin: customerAddresses.pin,
      isDefault: customerAddresses.isDefault,
    })
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, customerId))
    .orderBy(desc(customerAddresses.isDefault), desc(customerAddresses.createdAt));
}
