// GST/tax filing document queries — uncached like every other admin query (must always
// reflect live data). Computes tax live from whatever the current store settings say
// (see settings-queries.ts) rather than a per-order snapshot — see gst.ts and the plan's
// stated assumption: generate the CSV once at filing time, that's the record of truth.
import { and, desc, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "./index";
import { orders } from "./schema";
import { computeGst } from "@/lib/gst";
import { PAID_PAYMENT_STATUSES } from "@/lib/orders";
import type { DateRange } from "./report-queries";

export interface ConfiguredGstSettings {
  gstState: string;
  gstRatePercent: number;
  defaultHsnCode: string;
}

export interface GstSalesRegisterRow {
  orderNumber: string;
  date: string;
  channel: "direct" | "amazon" | "flipkart" | "meesho";
  customerName: string;
  state: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export async function getGstSalesRegister(range: DateRange, settings: ConfiguredGstSettings): Promise<GstSalesRegisterRow[]> {
  const rows = await db
    .select({
      orderNumber: orders.orderNumber,
      createdAt: orders.createdAt,
      channel: orders.channel,
      customerName: orders.customerName,
      state: orders.state,
      total: orders.total,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, range.start),
        lt(orders.createdAt, range.end),
        inArray(orders.paymentStatus, PAID_PAYMENT_STATUSES)
      )
    )
    .orderBy(orders.createdAt);

  return rows.map((r) => {
    const gst = computeGst(r.total, r.state, settings.gstState, settings.gstRatePercent);
    return {
      orderNumber: r.orderNumber,
      date: r.createdAt.toISOString().slice(0, 10),
      channel: r.channel,
      customerName: r.customerName,
      state: r.state ?? "",
      taxableValue: gst.taxableValue,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      total: r.total,
    };
  });
}

export interface GstHsnSummaryRow {
  hsnCode: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

// Single global HSN code (per the flat-rate decision), grouped as a real aggregate so a
// future per-product HSN column would slot in here without changing the Tax page itself.
export async function getGstHsnSummary(range: DateRange, settings: ConfiguredGstSettings): Promise<GstHsnSummaryRow[]> {
  const register = await getGstSalesRegister(range, settings);
  if (register.length === 0) return [];

  const totals = register.reduce(
    (acc, r) => ({
      taxableValue: acc.taxableValue + r.taxableValue,
      cgst: acc.cgst + r.cgst,
      sgst: acc.sgst + r.sgst,
      igst: acc.igst + r.igst,
    }),
    { taxableValue: 0, cgst: 0, sgst: 0, igst: 0 }
  );

  return [{ hsnCode: settings.defaultHsnCode, ...totals, totalTax: totals.cgst + totals.sgst + totals.igst }];
}

export interface ChannelBreakdownRow {
  channel: "direct" | "amazon" | "flipkart" | "meesho";
  orderCount: number;
  revenue: number;
}

// For TCS reconciliation against what Amazon/Flipkart/Meesho report they've deducted —
// doesn't need GST settings, just a revenue split by channel for the period.
export async function getChannelBreakdown(range: DateRange): Promise<ChannelBreakdownRow[]> {
  const rows = await db
    .select({
      channel: orders.channel,
      orderCount: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, range.start),
        lt(orders.createdAt, range.end),
        inArray(orders.paymentStatus, PAID_PAYMENT_STATUSES)
      )
    )
    .groupBy(orders.channel)
    .orderBy(desc(sql`sum(${orders.total})`));

  return rows.map((r) => ({ channel: r.channel, orderCount: Number(r.orderCount), revenue: Number(r.revenue) }));
}
