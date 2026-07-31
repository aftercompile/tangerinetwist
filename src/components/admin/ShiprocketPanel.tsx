"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck, RefreshCw, FileText, Tag, ExternalLink } from "lucide-react";
import {
  shipOrderViaShiprocket,
  refreshShiprocketTracking,
  getShiprocketLabelUrl,
  getShiprocketInvoiceUrl,
} from "@/lib/actions/shiprocket-actions";
import type { AdminOrderDetail } from "@/lib/db/admin-queries";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ShiprocketPanel({ order }: { order: AdminOrderDetail }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [shipping, setShipping] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [pkg, setPkg] = React.useState({ weight: 0.5, length: 20, breadth: 15, height: 10 });

  async function handleShip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShipping(true);
    try {
      const result = await shipOrderViaShiprocket(order.id, pkg);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Shipped via Shiprocket");
      setDialogOpen(false);
      router.refresh();
    } finally {
      setShipping(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const result = await refreshShiprocketTracking(order.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tracking updated");
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  async function handlePrintLabel() {
    const result = await getShiprocketLabelUrl(order.id);
    if (result.error || !result.url) {
      toast.error(result.error ?? "Failed to generate label");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function handlePrintInvoice() {
    // Generated automatically at ship time — only hits the server if that failed and
    // this is the first time it's actually being generated.
    if (order.invoiceUrl) {
      window.open(order.invoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const result = await getShiprocketInvoiceUrl(order.id);
    if (result.error || !result.url) {
      toast.error(result.error ?? "Failed to generate invoice");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
    router.refresh();
  }

  return (
    <Card className="h-fit">
      <CardContent className="flex flex-col gap-4 p-6">
        <h3 className="font-display text-lg text-charcoal">Shipping (Shiprocket)</h3>

        {!order.awbCode ? (
          <>
            <p className="text-sm text-muted">Not yet shipped via Shiprocket.</p>
            {!order.state && (
              <p className="text-xs text-red-600">
                This order has no state on file, which Shiprocket requires — it was placed before
                that field existed.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={!order.state}
              onClick={() => setDialogOpen(true)}
            >
              <Truck className="h-4 w-4" /> Ship via Shiprocket
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">AWB</span>
                <span className="font-medium text-charcoal">{order.awbCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Courier</span>
                <span className="font-medium text-charcoal">{order.courierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className="font-medium text-charcoal">{order.shiprocketStatus ?? "—"}</span>
              </div>
            </div>

            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-tangerine-600 hover:underline"
              >
                Track shipment <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={refreshing} onClick={handleRefresh}>
                <RefreshCw className="h-3.5 w-3.5" /> Refresh tracking
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintLabel}>
                <Tag className="h-3.5 w-3.5" /> Print label
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
                <FileText className="h-3.5 w-3.5" /> Print invoice
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title="Ship via Shiprocket" className="max-w-md p-8">
          <h2 className="h-display text-xl">Package details</h2>
          <p className="mt-1 text-sm text-muted">
            Used for Shiprocket&apos;s rate calculation — adjust if this order&apos;s actual
            package differs from the default.
          </p>
          <form onSubmit={handleShip} className="mt-6 flex flex-col gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={pkg.weight}
                onChange={(e) => setPkg((p) => ({ ...p, weight: Number(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="length">Length (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  min="1"
                  required
                  value={pkg.length}
                  onChange={(e) => setPkg((p) => ({ ...p, length: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="breadth">Breadth (cm)</Label>
                <Input
                  id="breadth"
                  type="number"
                  min="1"
                  required
                  value={pkg.breadth}
                  onChange={(e) => setPkg((p) => ({ ...p, breadth: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="1"
                  required
                  value={pkg.height}
                  onChange={(e) => setPkg((p) => ({ ...p, height: Number(e.target.value) }))}
                />
              </div>
            </div>
            <Button type="submit" variant="accent" size="lg" className="mt-2 w-full" disabled={shipping}>
              {shipping ? "Shipping..." : "Confirm & Ship"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
