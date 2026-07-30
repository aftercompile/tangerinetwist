"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db/index";
import { orderItems, orders, products } from "@/lib/db/schema";
import { calculateTotals } from "@/lib/orders";
import { placeOrderInputSchema, type PlaceOrderInput } from "@/lib/validation/order";

const ORDER_STATUSES = ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ error?: string; orderNumber?: string }> {
  const parsed = placeOrderInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order details" };
  }
  const { shipping, items } = parsed.data;

  // Never trust client-sent prices — cart lines are a denormalized localStorage snapshot
  // that can go stale or be tampered with. Re-read the current price from the DB.
  const slugs = items.map((i) => i.slug);
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      material: products.material,
      icon: products.icon,
    })
    .from(products)
    .where(inArray(products.slug, slugs));

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return { error: "Some items in your cart are no longer available." };
  }

  const orderItemRows = items.map((item) => {
    const product = bySlug.get(item.slug)!;
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      material: product.material,
      imageIcon: product.icon,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItemRows.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { shipping: shippingCost, total } = calculateTotals(subtotal);
  const orderNumber = `TT-${new Date().toISOString().slice(2, 7).replace("-", "")}-${randomUUID().split("-")[0].toUpperCase()}`;

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        status: "pending",
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        addressLine: shipping.address,
        city: shipping.city,
        pin: shipping.pin,
        paymentMethod: shipping.paymentMethod,
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

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ error?: string }> {
  await requireAdminSession();
  if (!ORDER_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");

  return {};
}
