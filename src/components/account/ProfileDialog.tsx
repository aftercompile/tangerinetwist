"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileAction } from "@/lib/actions/customer-actions";
import type { CurrentCustomer } from "@/lib/auth/customer-guard";
import { profileSchema } from "@/lib/validation/auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ProfileDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CurrentCustomer;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse({
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfileAction(parsed.data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated");
      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Edit profile" className="max-w-lg p-8">
        <h2 className="h-display text-xl">Edit profile</h2>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={customer.fullName} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={customer.phone ?? ""} />
          </div>
          <Button type="submit" variant="accent" size="lg" className="mt-2 w-full" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
