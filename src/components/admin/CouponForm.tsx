"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { couponFormSchema } from "@/lib/validation/coupon";
import { createCoupon, updateCoupon } from "@/lib/actions/coupon-actions";

// Raw, string-based editable shape — couponFormSchema's z.coerce.number() fields accept
// these strings directly at parse time (same reasoning CategoryForm.tsx's plain useState
// approach uses: no react-hook-form needed for a form this small).
export interface CouponFormRaw {
  id?: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: string;
  minOrderValue: string;
  maxUses: string;
  oncePerCustomer: boolean;
  expiresAt: string;
  active: boolean;
}

const emptyValues: CouponFormRaw = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "0",
  maxUses: "",
  oncePerCustomer: true,
  expiresAt: "",
  active: true,
};

export function CouponForm({
  initialValues,
  onSaved,
  onCancel,
}: {
  initialValues?: CouponFormRaw;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = React.useState<CouponFormRaw>(initialValues ?? emptyValues);
  const [submitting, setSubmitting] = React.useState(false);
  const mode = initialValues ? "edit" : "create";

  function update<K extends keyof CouponFormRaw>(key: K, value: CouponFormRaw[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = couponFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the errors and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === "create" ? await createCoupon(parsed.data) : await updateCoupon(parsed.data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(mode === "create" ? "Coupon created" : "Coupon updated");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="coupon-code">Code</Label>
        <Input
          id="coupon-code"
          value={values.code}
          onChange={(e) => update("code", e.target.value.toUpperCase())}
          placeholder="WELCOME10"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="coupon-type">Discount Type</Label>
          <Select value={values.discountType} onValueChange={(v) => update("discountType", v as "percentage" | "flat")}>
            <SelectTrigger id="coupon-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="flat">Flat Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="coupon-value">Discount Value ({values.discountType === "percentage" ? "%" : "₹"})</Label>
          <Input
            id="coupon-value"
            type="number"
            min={1}
            max={values.discountType === "percentage" ? 100 : undefined}
            value={values.discountValue}
            onChange={(e) => update("discountValue", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="coupon-min">Minimum Order Value (₹)</Label>
          <Input
            id="coupon-min"
            type="number"
            min={0}
            value={values.minOrderValue}
            onChange={(e) => update("minOrderValue", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="coupon-max-uses">Max Uses</Label>
          <Input
            id="coupon-max-uses"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={values.maxUses}
            onChange={(e) => update("maxUses", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="coupon-expires">Expiry Date</Label>
        <Input
          id="coupon-expires"
          type="date"
          value={values.expiresAt}
          onChange={(e) => update("expiresAt", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">Leave blank for a coupon that never expires.</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-charcoal">One redemption per customer</p>
          <p className="text-xs text-muted">Each email address can use this code once.</p>
        </div>
        <Switch checked={values.oncePerCustomer} onCheckedChange={(v) => update("oncePerCustomer", v)} />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-charcoal">Active</p>
          <p className="text-xs text-muted">Inactive coupons can&apos;t be applied at checkout.</p>
        </div>
        <Switch checked={values.active} onCheckedChange={(v) => update("active", v)} />
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create Coupon" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
