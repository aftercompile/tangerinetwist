// Admin Reports section — deliberately uncached like admin-queries.ts/metrics-queries.ts
// (admin data must always be live, never a stale storefront-style cache). Unlike
// metrics-queries.ts's trailing `days: number` window, every function here takes an
// explicit { start, end } range so the Reports page's date picker can select any period.
import { and, asc, desc, eq, gte, inArray, isNotNull, lt, sql } from "drizzle-orm";
import { db } from "./index";
import { categories, customers, orderItems, orders, productReviews, products } from "./schema";
import { PAID_PAYMENT_STATUSES } from "@/lib/orders";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CheckoutSourceBreakdown {
  source: string;
  orderCount: number;
  revenue: number;
}

// Historical orders placed before the Fastrr integration existed have checkoutSource: null
// (schema.ts) — bucketed as "unknown" rather than dropped, so old data isn't silently
// excluded from the total.
export async function getCheckoutSourceBreakdown({ start, end }: DateRange): Promise<CheckoutSourceBreakdown[]> {
  const rows = await db
    .select({
      source: sql<string>`coalesce(${orders.checkoutSource}, 'unknown')`,
      orderCount: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, start), lt(orders.createdAt, end), inArray(orders.paymentStatus, PAID_PAYMENT_STATUSES)))
    .groupBy(sql`coalesce(${orders.checkoutSource}, 'unknown')`)
    .orderBy(desc(sql`sum(${orders.total})`));

  return rows.map((r) => ({ source: r.source, orderCount: Number(r.orderCount), revenue: Number(r.revenue) }));
}

export interface PaymentMethodBreakdown {
  method: string;
  orderCount: number;
  revenue: number;
}

// COD orders have paymentMethod: null by design (schema.ts comment — nothing to wait on,
// set immediately) and are distinguished by paymentStatus: "cod" instead, so this can't
// just group on paymentMethod directly or every COD order would land in one "null" bucket
// indistinguishable from a still-pending online payment.
//
// Deliberately NOT filtered to PAID_PAYMENT_STATUSES like every other report here — this
// is the one place a "Pending" bucket is the point (it's how an admin sees how much is
// stuck in abandoned/incomplete checkouts), not a revenue figure to be trusted at face
// value the way the KPI cards are.
export async function getPaymentMethodBreakdown({ start, end }: DateRange): Promise<PaymentMethodBreakdown[]> {
  // paymentMethod is a Postgres enum column — coalesce(...) against a plain string literal
  // like 'Pending' fails at the DB level ("invalid input value for enum payment_method")
  // unless the column is cast to text first, since Postgres won't implicitly widen an enum
  // value to match a text literal the way it does for two enum values of the same type.
  const methodExpr = sql<string>`case when ${orders.paymentStatus} = 'cod' then 'COD' else coalesce(${orders.paymentMethod}::text, 'Pending') end`;

  const rows = await db
    .select({
      method: methodExpr,
      orderCount: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, start), lt(orders.createdAt, end)))
    .groupBy(methodExpr)
    .orderBy(desc(sql`sum(${orders.total})`));

  return rows.map((r) => ({ method: r.method, orderCount: Number(r.orderCount), revenue: Number(r.revenue) }));
}

export interface CustomerRetention {
  newCustomers: number;
  returningCustomers: number;
  repeatPurchaseRatePct: number;
}

// Classifies each customer who ordered in the range by whether the range start falls
// before or after their very first order EVER (not just their first order in-range) —
// firstOrderAt is computed over the full orders table, unbounded by the report's date
// filter, otherwise every customer would look "new" in whatever range you pick. Guest
// orders (customerId IS NULL) are excluded — there's no identity to classify as
// new/returning.
export async function getCustomerRetention({ start, end }: DateRange): Promise<CustomerRetention> {
  const firstOrder = db.$with("first_order").as(
    db
      .select({
        customerId: orders.customerId,
        firstOrderAt: sql<Date>`min(${orders.createdAt})`.as("first_order_at"),
      })
      .from(orders)
      .where(and(isNotNull(orders.customerId), inArray(orders.paymentStatus, PAID_PAYMENT_STATUSES)))
      .groupBy(orders.customerId)
  );

  const rows = await db
    .with(firstOrder)
    .selectDistinct({
      customerId: orders.customerId,
      // A raw JS Date interpolated directly into a sql`` template isn't serialized the way
      // postgres-js expects (unlike gte()/lt() below, which drizzle-orm encodes for you) —
      // it must be passed as an ISO string here instead, or the driver throws trying to
      // treat the Date as a Buffer.
      isNew: sql<boolean>`${firstOrder.firstOrderAt} >= ${start.toISOString()}`,
    })
    .from(orders)
    .innerJoin(firstOrder, eq(firstOrder.customerId, orders.customerId))
    .where(
      and(
        gte(orders.createdAt, start),
        lt(orders.createdAt, end),
        isNotNull(orders.customerId),
        inArray(orders.paymentStatus, PAID_PAYMENT_STATUSES)
      )
    );

  const newCustomers = rows.filter((r) => r.isNew).length;
  const returningCustomers = rows.length - newCustomers;
  const totalIdentified = rows.length;

  return {
    newCustomers,
    returningCustomers,
    repeatPurchaseRatePct: totalIdentified > 0 ? (returningCustomers / totalIdentified) * 100 : 0,
  };
}

export interface TopCustomerByLtv {
  id: string;
  email: string;
  fullName: string;
  orderCount: number;
  lifetimeValue: number;
}

// LTV is inherently all-time, not scoped to the report's date range — reuses the exact
// aggregation getAdminCustomerRows (admin-queries.ts) already does, just sorted/limited
// instead of returning every customer.
export async function getTopCustomersByLtv(limit = 10): Promise<TopCustomerByLtv[]> {
  const rows = await db
    .select({
      id: customers.id,
      email: customers.email,
      fullName: customers.fullName,
      orderCount: sql<number>`count(${orders.id})`,
      lifetimeValue: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(customers)
    // The paid-only filter belongs in the JOIN's ON clause, not a WHERE — a customer whose
    // only order is still payment-pending must still appear (with ₹0 LTV), not disappear
    // from the list entirely the way a WHERE filter on the joined table would cause.
    .leftJoin(orders, and(eq(orders.customerId, customers.id), inArray(orders.paymentStatus, PAID_PAYMENT_STATUSES)))
    .groupBy(customers.id)
    .orderBy(desc(sql`coalesce(sum(${orders.total}), 0)`))
    .limit(limit);

  return rows.map((r) => ({ ...r, orderCount: Number(r.orderCount), lifetimeValue: Number(r.lifetimeValue) }));
}

export interface ReviewAnalytics {
  totalReviews: number;
  avgRatingInPeriod: number;
  verifiedPct: number;
  ratingDistribution: { rating: number; count: number }[];
  lowestRatedProducts: { productId: string; name: string; slug: string; rating: number; reviewCount: number }[];
}

export async function getReviewAnalytics({ start, end }: DateRange): Promise<ReviewAnalytics> {
  const [summary, distributionRows, lowestRated] = await Promise.all([
    db
      .select({
        totalReviews: sql<number>`count(*)`,
        avgRating: sql<number>`coalesce(avg(${productReviews.rating}), 0)`,
        verifiedCount: sql<number>`coalesce(sum(case when ${productReviews.verified} then 1 else 0 end), 0)`,
      })
      .from(productReviews)
      .where(and(gte(productReviews.createdAt, start), lt(productReviews.createdAt, end)))
      .then((rows) => rows[0]),
    db
      .select({ rating: productReviews.rating, count: sql<number>`count(*)` })
      .from(productReviews)
      .where(and(gte(productReviews.createdAt, start), lt(productReviews.createdAt, end)))
      .groupBy(productReviews.rating)
      .orderBy(asc(productReviews.rating)),
    // Live, all-time rating — "which products need attention right now" is a current-state
    // question, not a period one, same reasoning as getLowStockProducts (metrics-queries.ts)
    // ignoring the date range entirely.
    db
      .select({ productId: products.id, name: products.name, slug: products.slug, rating: products.rating, reviewCount: products.reviewCount })
      .from(products)
      .where(sql`${products.reviewCount} > 0`)
      .orderBy(asc(products.rating))
      .limit(5),
  ]);

  const totalReviews = Number(summary?.totalReviews ?? 0);
  const verifiedCount = Number(summary?.verifiedCount ?? 0);

  return {
    totalReviews,
    avgRatingInPeriod: Number(summary?.avgRating ?? 0),
    verifiedPct: totalReviews > 0 ? (verifiedCount / totalReviews) * 100 : 0,
    ratingDistribution: distributionRows.map((r) => ({ rating: r.rating, count: Number(r.count) })),
    lowestRatedProducts: lowestRated.map((p) => ({ ...p, rating: Number(p.rating) })),
  };
}

export interface CategoryMaterialSellThrough {
  categoryName: string;
  material: string;
  revenue: number;
  unitsSold: number;
}

// Grouped on orderItems' own snapshot columns (categoryName via a join, material inline)
// rather than live products.material — same precedent getTopProducts (metrics-queries.ts)
// already sets by reading order-time snapshot data instead of the current product row.
export async function getCategoryMaterialSellThrough({ start, end }: DateRange): Promise<CategoryMaterialSellThrough[]> {
  const rows = await db
    .select({
      categoryName: categories.name,
      material: orderItems.material,
      revenue: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
      unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(gte(orders.createdAt, start), lt(orders.createdAt, end), inArray(orders.paymentStatus, PAID_PAYMENT_STATUSES)))
    .groupBy(categories.id, categories.name, orderItems.material)
    .orderBy(desc(sql`sum(${orderItems.price} * ${orderItems.quantity})`));

  return rows.map((r) => ({ ...r, revenue: Number(r.revenue), unitsSold: Number(r.unitsSold) }));
}
