"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteCoupon } from "@/lib/actions/coupon-actions";
import type { AdminCouponRow } from "@/lib/db/admin-queries";
import { CouponForm, type CouponFormRaw } from "./CouponForm";

function toFormValues(row: AdminCouponRow): CouponFormRaw {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discountType,
    discountValue: String(row.discountValue),
    minOrderValue: String(row.minOrderValue),
    maxUses: row.maxUses === null ? "" : String(row.maxUses),
    oncePerCustomer: row.oncePerCustomer,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString().slice(0, 10) : "",
    active: row.active,
  };
}

export function CouponsManager({ coupons }: { coupons: AdminCouponRow[] }) {
  const router = useRouter();
  const [dialogState, setDialogState] = React.useState<{ open: false } | { open: true; initialValues?: CouponFormRaw }>({
    open: false,
  });
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  function closeDialog() {
    setDialogState({ open: false });
  }

  function handleSaved() {
    closeDialog();
    router.refresh();
  }

  async function handleDelete(row: AdminCouponRow) {
    if (!confirm(`Delete coupon "${row.code}"? This cannot be undone.`)) return;
    setDeletingId(row.id);
    try {
      const result = await deleteCoupon(row.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Coupon deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogState({ open: true })}>
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-warm-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min. Order</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted">
                  No coupons yet.
                </TableCell>
              </TableRow>
            )}
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.code}</TableCell>
                <TableCell>{c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}</TableCell>
                <TableCell>{c.minOrderValue > 0 ? `₹${c.minOrderValue}` : "—"}</TableCell>
                <TableCell>
                  {c.usedCount}
                  {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                  {c.oncePerCustomer && <span className="ml-1 text-xs text-muted">(1/customer)</span>}
                </TableCell>
                <TableCell>
                  {c.expiresAt ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(c.expiresAt) : "Never"}
                </TableCell>
                <TableCell>
                  <Badge variant={c.active ? "bestseller" : "outline"}>{c.active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${c.code}`}
                      onClick={() => setDialogState({ open: true, initialValues: toFormValues(c) })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${c.code}`}
                      disabled={deletingId === c.id}
                      onClick={() => handleDelete(c)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent title={dialogState.open && dialogState.initialValues ? "Edit Coupon" : "New Coupon"} className="max-w-lg p-7">
          <CouponForm
            initialValues={dialogState.open ? dialogState.initialValues : undefined}
            onSaved={handleSaved}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
