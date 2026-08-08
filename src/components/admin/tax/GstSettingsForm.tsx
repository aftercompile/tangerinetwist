"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateGstSettings } from "@/lib/actions/settings-actions";
import type { StoreSettings } from "@/lib/db/settings-queries";

export function GstSettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [gstState, setGstState] = React.useState(settings.gstState ?? "");
  const [gstRatePercent, setGstRatePercent] = React.useState(settings.gstRatePercent?.toString() ?? "");
  const [defaultHsnCode, setDefaultHsnCode] = React.useState(settings.defaultHsnCode ?? "");
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateGstSettings({ gstState, gstRatePercent: Number(gstRatePercent), defaultHsnCode });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("GST settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <Label htmlFor="gst-state">GST-registered state</Label>
        <Input
          id="gst-state"
          placeholder="e.g. Maharashtra"
          value={gstState}
          onChange={(e) => setGstState(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">
          Orders shipping to this state get CGST+SGST; every other state gets IGST.
        </p>
      </div>
      <div>
        <Label htmlFor="gst-rate">GST rate (%)</Label>
        <Input
          id="gst-rate"
          type="number"
          min={0}
          max={100}
          step="0.01"
          placeholder="e.g. 18"
          value={gstRatePercent}
          onChange={(e) => setGstRatePercent(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">Applied to every product — prices are treated as GST-inclusive.</p>
      </div>
      <div>
        <Label htmlFor="gst-hsn">Default HSN code</Label>
        <Input
          id="gst-hsn"
          placeholder="e.g. 3926"
          value={defaultHsnCode}
          onChange={(e) => setDefaultHsnCode(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">Used for every order line in the HSN-wise summary.</p>
      </div>
      <div className="sm:col-span-3">
        <Button type="button" variant="accent" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save GST settings"}
        </Button>
      </div>
    </div>
  );
}
