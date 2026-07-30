"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, Package } from "lucide-react";
import { signOutAction } from "@/lib/actions/customer-auth-actions";
import { deleteAddressAction } from "@/lib/actions/customer-actions";
import type { CurrentCustomer } from "@/lib/auth/customer-guard";
import type { CustomerAddressRow, CustomerOrderRow } from "@/lib/db/customer-queries";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { AddressDialog } from "./AddressDialog";

const STATUS_LABEL: Record<CustomerOrderRow["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function AccountDashboard({
  customer,
  orders,
  addresses,
}: {
  customer: CurrentCustomer;
  orders: CustomerOrderRow[];
  addresses: CustomerAddressRow[];
}) {
  // undefined = dialog closed, null = adding a new address, row = editing that address.
  const [editingAddress, setEditingAddress] = React.useState<CustomerAddressRow | null | undefined>(undefined);

  async function handleDelete(id: string) {
    if (!confirm("Remove this address?")) return;
    const result = await deleteAddressAction(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Address removed");
  }

  return (
    <div className="container-wide py-16 lg:py-24">
      <AnimatedReveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Account</p>
          <h1 className="h-display text-3xl md:text-4xl">Hi, {customer.fullName.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-muted">{customer.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="md">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </form>
      </AnimatedReveal>

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.2fr]">
        <AnimatedReveal delay={0.05}>
          <div className="flex items-center justify-between">
            <h2 className="h-display text-xl">Saved addresses</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditingAddress(null)}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {addresses.length === 0 && <p className="text-sm text-muted">No saved addresses yet.</p>}
            {addresses.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {a.label}
                      {a.isDefault && <span className="ml-1.5 text-xs font-normal text-tangerine-600">Default</span>}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {a.fullName} · {a.phone}
                    </p>
                    <p className="text-sm text-muted">
                      {a.addressLine}, {a.city} {a.pin}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" aria-label="Edit address" onClick={() => setEditingAddress(a)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete address" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.1}>
          <h2 className="h-display text-xl">Order history</h2>
          <div className="mt-5 flex flex-col divide-y divide-border rounded-2xl border border-border">
            {orders.length === 0 && <p className="p-5 text-sm text-muted">No orders yet.</p>}
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-beige">
                    <Package className="h-4 w-4 text-tangerine-600" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{o.orderNumber}</p>
                    <p className="text-xs text-muted">
                      {o.itemCount} item{o.itemCount === 1 ? "" : "s"} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-charcoal">{formatINR(o.total)}</p>
                  <p className="text-xs text-muted">{STATUS_LABEL[o.status]}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedReveal>
      </div>

      <AddressDialog
        open={editingAddress !== undefined}
        onOpenChange={(open) => !open && setEditingAddress(undefined)}
        address={editingAddress ?? undefined}
      />
    </div>
  );
}
