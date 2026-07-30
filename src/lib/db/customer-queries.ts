import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { customerAddresses, orderItems, orders } from "./schema";

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
