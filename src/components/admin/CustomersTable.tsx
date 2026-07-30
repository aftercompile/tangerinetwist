"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { AdminCustomerRow } from "@/lib/db/admin-queries";

const PAGE_SIZE = 10;

export function CustomersTable({ customers }: { customers: AdminCustomerRow[] }) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.email.toLowerCase().includes(q) || c.fullName.toLowerCase().includes(q));
  }, [customers, search]);

  React.useEffect(() => setPage(1), [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="pl-10"
        />
      </div>

      <div className="rounded-2xl border border-border bg-warm-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Lifetime Value</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted">
                  No customers match this search.
                </TableCell>
              </TableRow>
            )}
            {pageItems.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-medium text-charcoal">{c.fullName}</p>
                  <p className="text-xs text-muted">{c.email}</p>
                </TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>{c.orderCount}</TableCell>
                <TableCell>{formatINR(c.lifetimeValue)}</TableCell>
                <TableCell>
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
