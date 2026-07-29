import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { db } from "./index";
import { categories, orderItems, orders, products } from "./schema";

export interface PeriodKpis {
  revenue: number;
  orderCount: number;
  aov: number;
  unitsSold: number;
}

export interface KpiComparison {
  current: PeriodKpis;
  deltaPct: {
    revenue: number | null;
    orderCount: number | null;
    aov: number | null;
    unitsSold: number | null;
  };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

async function computePeriodKpis(start: Date, end: Date): Promise<PeriodKpis> {
  const [orderStats] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      orderCount: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, start), lt(orders.createdAt, end)));

  const [unitStats] = await db
    .select({
      unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(gte(orders.createdAt, start), lt(orders.createdAt, end)));

  const revenue = Number(orderStats.revenue);
  const orderCount = Number(orderStats.orderCount);
  return {
    revenue,
    orderCount,
    aov: orderCount > 0 ? revenue / orderCount : 0,
    unitsSold: Number(unitStats.unitsSold),
  };
}

export async function getKpis(days: number): Promise<KpiComparison> {
  const now = new Date();
  const periodStart = subDays(now, days);
  const previousPeriodStart = subDays(periodStart, days);

  const [current, previous] = await Promise.all([
    computePeriodKpis(periodStart, now),
    computePeriodKpis(previousPeriodStart, periodStart),
  ]);

  return {
    current,
    deltaPct: {
      revenue: pctChange(current.revenue, previous.revenue),
      orderCount: pctChange(current.orderCount, previous.orderCount),
      aov: pctChange(current.aov, previous.aov),
      unitsSold: pctChange(current.unitsSold, previous.unitsSold),
    },
  };
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function getRevenueOverTime(days: number): Promise<RevenuePoint[]> {
  const start = subDays(new Date(), days);

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      orderCount: sql<number>`count(*)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, start))
    .groupBy(sql`date_trunc('day', ${orders.createdAt})`);

  const byDay = new Map(rows.map((r) => [r.day, { revenue: Number(r.revenue), orders: Number(r.orderCount) }]));

  return eachDayOfInterval({ start, end: new Date() }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const found = byDay.get(key);
    return { date: key, revenue: found?.revenue ?? 0, orders: found?.orders ?? 0 };
  });
}

export interface CategoryRevenue {
  categoryName: string;
  revenue: number;
  unitsSold: number;
}

export async function getRevenueByCategory(days: number): Promise<CategoryRevenue[]> {
  const start = subDays(new Date(), days);

  const rows = await db
    .select({
      categoryName: categories.name,
      revenue: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
      unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(gte(orders.createdAt, start))
    .groupBy(categories.id, categories.name)
    .orderBy(desc(sql`sum(${orderItems.price} * ${orderItems.quantity})`));

  return rows.map((r) => ({ categoryName: r.categoryName, revenue: Number(r.revenue), unitsSold: Number(r.unitsSold) }));
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export async function getOrderStatusBreakdown(days: number): Promise<StatusBreakdown[]> {
  const start = subDays(new Date(), days);

  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, start))
    .groupBy(orders.status);

  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
}

export interface TopProduct {
  productId: string | null;
  name: string;
  slug: string;
  revenue: number;
  unitsSold: number;
}

export async function getTopProducts(days: number, limit = 6): Promise<TopProduct[]> {
  const start = subDays(new Date(), days);

  const rows = await db
    .select({
      productId: orderItems.productId,
      name: orderItems.name,
      slug: orderItems.slug,
      revenue: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
      unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(gte(orders.createdAt, start))
    .groupBy(orderItems.productId, orderItems.name, orderItems.slug)
    .orderBy(desc(sql`sum(${orderItems.price} * ${orderItems.quantity})`))
    .limit(limit);

  return rows.map((r) => ({ ...r, revenue: Number(r.revenue), unitsSold: Number(r.unitsSold) }));
}

export interface LowStockProduct {
  id: string;
  slug: string;
  name: string;
  stock: "in-stock" | "made-to-order" | "low-stock";
}

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const rows = await db
    .select({ id: products.id, slug: products.slug, name: products.name, stock: products.stock })
    .from(products)
    .where(eq(products.stock, "low-stock"));
  return rows;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
}

export async function getRecentOrders(limit = 10): Promise<RecentOrder[]> {
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}
