"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, avg, count, eq } from "drizzle-orm";
import { requireCustomerSession } from "@/lib/auth/customer-guard";
import { db } from "@/lib/db/index";
import { orderItems, orders, productReviews, products } from "@/lib/db/schema";
import { reviewSchema, type ReviewInput } from "@/lib/validation/review";

// A review can only be written from a specific delivered order that actually contains
// the product — never just "has this customer ever bought this," since that would let
// a review through for an order that's still pending/cancelled.
async function findEligibleOrder(customerId: string, orderId: string, productId: string) {
  const [row] = await db
    .select({ city: orders.city })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.customerId, customerId),
        eq(orders.status, "delivered"),
        eq(orderItems.productId, productId)
      )
    )
    .limit(1);
  return row;
}

async function recomputeProductRating(productId: string) {
  const [row] = await db
    .select({ avgRating: avg(productReviews.rating), reviewCount: count(productReviews.id) })
    .from(productReviews)
    .where(eq(productReviews.productId, productId));

  await db
    .update(products)
    .set({
      rating: row?.avgRating ? Number(row.avgRating).toFixed(2) : "0",
      reviewCount: row?.reviewCount ?? 0,
    })
    .where(eq(products.id, productId));
}

export async function submitProductReviewAction(input: ReviewInput): Promise<{ error?: string }> {
  const customer = await requireCustomerSession();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { productId, orderId, rating, title, body } = parsed.data;

  const eligibleOrder = await findEligibleOrder(customer.id, orderId, productId);
  if (!eligibleOrder) {
    return { error: "You can only review products from your delivered orders." };
  }

  const [existing] = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.customerId, customer.id)));
  if (existing) {
    return { error: "You've already reviewed this product." };
  }

  try {
    await db.insert(productReviews).values({
      productId,
      customerId: customer.id,
      author: customer.fullName,
      location: eligibleOrder.city ?? "India",
      rating,
      title,
      body,
      verified: true,
    });
  } catch (err) {
    // Race-condition safety net — the pre-check above already covers the common case.
    if ((err as { cause?: { code?: string } })?.cause?.code === "23505") {
      return { error: "You've already reviewed this product." };
    }
    throw err;
  }

  await recomputeProductRating(productId);

  revalidateTag("products");
  revalidatePath(`/account/orders/${orderId}`);

  return {};
}
