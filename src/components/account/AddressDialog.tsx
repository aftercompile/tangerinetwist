"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveAddressAction } from "@/lib/actions/customer-actions";
import type { CustomerAddressRow } from "@/lib/db/customer-queries";
import { addressSchema } from "@/lib/validation/auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES } from "@/lib/data/indian-states";

export function AddressDialog({
  open,
  onOpenChange,
  address,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: CustomerAddressRow;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [isDefault, setIsDefault] = React.useState(address?.isDefault ?? false);
  const [state, setState] = React.useState(address?.state ?? "");

  // Reset local state (Select/Checkbox aren't part of native FormData) whenever a
  // different address (or "add new") is opened, since Dialog content isn't remounted
  // between opens.
  React.useEffect(() => {
    if (open) {
      setIsDefault(address?.isDefault ?? false);
      setState(address?.state ?? "");
    }
  }, [open, address]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = addressSchema.safeParse({
      id: address?.id,
      label: String(formData.get("label") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      addressLine: String(formData.get("addressLine") ?? ""),
      city: String(formData.get("city") ?? ""),
      state,
      pin: String(formData.get("pin") ?? ""),
      isDefault,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSaving(true);
    try {
      const result = await saveAddressAction(parsed.data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(address ? "Address updated" : "Address added");
      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={address ? "Edit address" : "Add address"} className="max-w-lg p-8">
        <h2 className="h-display text-xl">{address ? "Edit address" : "Add address"}</h2>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" defaultValue={address?.label ?? "Home"} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={address?.phone} required />
            </div>
          </div>
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={address?.fullName} required />
          </div>
          <div>
            <Label htmlFor="addressLine">Address</Label>
            <Input id="addressLine" name="addressLine" defaultValue={address?.addressLine} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={address?.city} required />
            </div>
            <div>
              <Label htmlFor="pin">PIN code</Label>
              <Input id="pin" name="pin" defaultValue={address?.pin} required />
            </div>
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-charcoal">
            <Checkbox checked={isDefault} onCheckedChange={(c) => setIsDefault(c === true)} />
            Set as default address
          </label>
          <Button type="submit" variant="accent" size="lg" className="mt-2 w-full" disabled={saving}>
            {saving ? "Saving..." : "Save address"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
