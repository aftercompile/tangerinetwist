"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { AdminOrderRow } from "@/lib/db/admin-queries";

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

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (
        q &&
        !o.orderNumber.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q) &&
        !o.customerEmail.toLowerCase().includes(q)
      )
        return false;
      if (status !== "all" && o.status !== status) return false;
      return true;
    });
  }, [orders, search, status]);

  React.useEffect(() => setPage(1), [search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
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
      </div>

      <div className="rounded-2xl border border-border bg-warm-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
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
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted">
                  No orders match these filters.
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
