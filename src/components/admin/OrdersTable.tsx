"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatINR, cn } from "@/lib/utils";
import { PAID_PAYMENT_STATUSES } from "@/lib/orders";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { AdminOrderRow } from "@/lib/db/admin-queries";

// Whether an order represents money actually committed — see PAID_PAYMENT_STATUSES'
// own doc comment for why "pending"/"failed" don't count. Cast needed because
// Array.prototype.includes on a readonly literal tuple won't accept the wider
// paymentStatus union without it.
function isRealOrder(o: AdminOrderRow): boolean {
  return (PAID_PAYMENT_STATUSES as readonly string[]).includes(o.paymentStatus);
}

const PAGE_SIZE = 15;

const statusBadgeVariant: Record<AdminOrderRow["status"], "outline" | "soft" | "bestseller" | "new" | "limited"> = {
  pending: "outline",
  confirmed: "soft",
  in_production: "soft",
  shipped: "new",
  delivered: "bestseller",
  cancelled: "limited",
};

const paymentBadgeVariant: Record<AdminOrderRow["paymentStatus"], "outline" | "soft" | "bestseller" | "limited"> = {
  pending: "outline",
  paid: "bestseller",
  failed: "limited",
  cod: "soft",
};

const paymentBadgeLabel: Record<AdminOrderRow["paymentStatus"], string> = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  cod: "COD",
};

const channelLabel: Record<AdminOrderRow["channel"], string> = {
  direct: "Direct",
  amazon: "Amazon",
  flipkart: "Flipkart",
  meesho: "Meesho",
};

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const [tab, setTab] = React.useState<"orders" | "pending">("orders");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [channel, setChannel] = React.useState("all");
  const [page, setPage] = React.useState(1);

  // Payment-pending/failed orders (mostly abandoned online checkouts — a Razorpay order
  // was opened but never confirmed) are split into their own tab rather than mixed into
  // the main list, matching how every revenue/order-count query now excludes them too.
  const realOrders = React.useMemo(() => orders.filter(isRealOrder), [orders]);
  const pendingOrders = React.useMemo(() => orders.filter((o) => !isRealOrder(o)), [orders]);
  const scoped = tab === "orders" ? realOrders : pendingOrders;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoped.filter((o) => {
      if (
        q &&
        !o.orderNumber.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q) &&
        !o.customerEmail.toLowerCase().includes(q)
      )
        return false;
      if (status !== "all" && o.status !== status) return false;
      if (channel !== "all" && o.channel !== channel) return false;
      return true;
    });
  }, [scoped, search, status, channel]);

  React.useEffect(() => setPage(1), [search, status, channel, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={cn(
            "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
            tab === "orders" ? "border-tangerine-500 text-charcoal" : "border-transparent text-muted hover:text-charcoal"
          )}
        >
          Orders <span className="text-xs text-muted">({realOrders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("pending")}
          className={cn(
            "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
            tab === "pending" ? "border-tangerine-500 text-charcoal" : "border-transparent text-muted hover:text-charcoal"
          )}
        >
          Pending <span className="text-xs text-muted">({pendingOrders.length})</span>
        </button>
      </div>

      {tab === "pending" && (
        <p className="text-xs text-muted">
          Payment never completed — mostly abandoned online checkouts. Not counted toward revenue or order stats
          anywhere in the admin.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, email..."
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_production">In Production</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="flipkart">Flipkart</SelectItem>
            <SelectItem value="meesho">Meesho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-warm-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted">
                  {tab === "pending" ? "No pending orders." : "No orders match these filters."}
                </TableCell>
              </TableRow>
            )}
            {pageItems.map((o) => (
              <TableRow key={o.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-charcoal hover:underline">
                    {o.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="soft">{channelLabel[o.channel]}</Badge>
                </TableCell>
                <TableCell>
                  <p>{o.customerName}</p>
                  <p className="text-xs text-muted">{o.customerEmail}</p>
                </TableCell>
                <TableCell>{o.itemCount}</TableCell>
                <TableCell>{formatINR(o.total)}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={statusBadgeVariant[o.status]}>{o.status.replace("_", " ")}</Badge>
                    <Badge variant={paymentBadgeVariant[o.paymentStatus]}>{paymentBadgeLabel[o.paymentStatus]}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted">
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(o.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
