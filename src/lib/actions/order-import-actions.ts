"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db/index";
import { orderItems, orders } from "@/lib/db/schema";
import { generateOrderNumber } from "@/lib/orders";
import { importedOrderRowSchema, type ImportedOrderRow } from "@/lib/validation/order-import";

const IMPORT_CHANNELS = ["amazon", "flipkart", "meesho"] as const;
export type ImportChannel = (typeof IMPORT_CHANNELS)[number];

const ORDER_STATUSES = ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"] as const;
export type ImportOrderStatus = (typeof ORDER_STATUSES)[number];

function parseOrderDate(value: string | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

// Imports CSV-exported marketplace orders. Rows sharing the same externalOrderId are
// grouped into one order with multiple order_items — a marketplace order with 2+
// products exports as 2+ rows under the same order id, not 2+ separate orders. Already-
// imported (channel, externalOrderId) pairs are silently skipped (not errored) so an
// admin can re-upload the same export after the marketplace adds new orders to it.
export async function importMarketplaceOrders(
  channel: ImportChannel,
  rows: ImportedOrderRow[],
  status: ImportOrderStatus
): Promise<{ error?: string; imported?: number; skipped?: number }> {
  await requireAdminSession();

  if (!IMPORT_CHANNELS.includes(channel)) return { error: "Invalid channel" };
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid status" };
  if (rows.length === 0) return { error: "No rows to import" };

  const parsedRows: ImportedOrderRow[] = [];
  for (const row of rows) {
    const parsed = importedOrderRowSchema.safeParse(row);
    if (!parsed.success) {
      return { error: `Order ${row.externalOrderId || "?"}: ${parsed.error.issues[0]?.message}` };
    }
    parsedRows.push(parsed.data);
  }

  const groups = new Map<string, ImportedOrderRow[]>();
  for (const row of parsedRows) {
    const existing = groups.get(row.externalOrderId);
    if (existing) existing.push(row);
    else groups.set(row.externalOrderId, [row]);
  }

  const externalIds = [...groups.keys()];
  const existingRows = await db
    .select({ externalOrderId: orders.externalOrderId })
    .from(orders)
    .where(and(eq(orders.channel, channel), inArray(orders.externalOrderId, externalIds)));
  const alreadyImported = new Set(existingRows.map((r) => r.externalOrderId));

  let imported = 0;
  let skipped = 0;

  for (const [externalOrderId, groupRows] of groups) {
    if (alreadyImported.has(externalOrderId)) {
      skipped++;
      continue;
    }

    const first = groupRows[0];
    const subtotal = groupRows.reduce((sum, r) => sum + r.lineTotal, 0);
    const orderNumber = generateOrderNumber();
    const createdAt = parseOrderDate(first.orderDate);

    await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          status,
          channel,
          externalOrderId,
          customerName: first.customerName,
          customerEmail: first.customerEmail || "",
          customerPhone: first.customerPhone || "",
          addressLine: first.addressLine,
          city: first.city,
          state: first.state,
          pin: first.pin,
          paymentMethod: null,
          paymentStatus: "paid",
          subtotal,
          shipping: 0,
          total: subtotal,
          createdAt,
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        groupRows.map((r) => ({
          orderId: order.id,
          productId: null,
          name: r.productName,
          slug: "",
          price: Math.round(r.lineTotal / r.quantity),
          material: "",
          imageIcon: "Package",
          quantity: r.quantity,
        }))
      );
    });

    imported++;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return { imported, skipped };
}
