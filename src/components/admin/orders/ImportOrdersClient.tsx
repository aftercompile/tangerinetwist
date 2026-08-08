"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseCsv } from "@/lib/csv";
import { formatINR } from "@/lib/utils";
import { REQUIRED_IMPORT_FIELDS, type ImportedOrderRow } from "@/lib/validation/order-import";
import { importMarketplaceOrders, type ImportChannel, type ImportOrderStatus } from "@/lib/actions/order-import-actions";

const CHANNELS: { value: ImportChannel; label: string }[] = [
  { value: "amazon", label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "meesho", label: "Meesho" },
];

const STATUSES: ImportOrderStatus[] = ["pending", "confirmed", "in_production", "shipped", "delivered"];

const UNMAPPED = "__unmapped__";

function mappingKey(channel: ImportChannel) {
  return `tt-import-mapping-${channel}`;
}

export function ImportOrdersClient() {
  const router = useRouter();
  const [channel, setChannel] = React.useState<ImportChannel>("amazon");
  const [header, setHeader] = React.useState<string[]>([]);
  const [dataRows, setDataRows] = React.useState<string[][]>([]);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<ImportOrderStatus>("delivered");
  const [importing, setImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function loadSavedMapping(forChannel: ImportChannel, availableHeaders: string[]) {
    try {
      const saved = JSON.parse(localStorage.getItem(mappingKey(forChannel)) ?? "{}") as Record<string, string>;
      const restored: Record<string, string> = {};
      for (const field of REQUIRED_IMPORT_FIELDS) {
        const savedHeaderName = saved[field.key];
        if (savedHeaderName && availableHeaders.includes(savedHeaderName)) {
          restored[field.key] = savedHeaderName;
        }
      }
      setMapping(restored);
    } catch {
      setMapping({});
    }
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      toast.error("That CSV has no data rows.");
      return;
    }
    const [headerRow, ...rest] = rows;
    setHeader(headerRow);
    setDataRows(rest);
    loadSavedMapping(channel, headerRow);
  }

  function updateMapping(fieldKey: string, headerName: string) {
    const next = { ...mapping, [fieldKey]: headerName === UNMAPPED ? "" : headerName };
    setMapping(next);
    localStorage.setItem(mappingKey(channel), JSON.stringify(next));
  }

  function handleChannelChange(value: string) {
    const nextChannel = value as ImportChannel;
    setChannel(nextChannel);
    if (header.length > 0) loadSavedMapping(nextChannel, header);
  }

  const requiredMapped = REQUIRED_IMPORT_FIELDS.filter((f) => f.required).every((f) => mapping[f.key]);

  const mappedRows: ImportedOrderRow[] = React.useMemo(() => {
    if (!requiredMapped || header.length === 0) return [];
    return dataRows
      .filter((row) => row.some((cell) => cell.trim() !== ""))
      .map((row) => {
        const get = (fieldKey: string) => {
          const headerName = mapping[fieldKey];
          if (!headerName) return "";
          const idx = header.indexOf(headerName);
          return idx >= 0 ? (row[idx] ?? "").trim() : "";
        };
        return {
          externalOrderId: get("externalOrderId"),
          orderDate: get("orderDate") || undefined,
          customerName: get("customerName"),
          customerPhone: get("customerPhone") || undefined,
          customerEmail: get("customerEmail") || undefined,
          addressLine: get("addressLine"),
          city: get("city"),
          state: get("state"),
          pin: get("pin"),
          productName: get("productName"),
          quantity: Number(get("quantity")) || 0,
          lineTotal: Number(get("lineTotal")) || 0,
        };
      });
  }, [dataRows, header, mapping, requiredMapped]);

  const preview = React.useMemo(() => {
    const orderIds = new Set(mappedRows.map((r) => r.externalOrderId).filter(Boolean));
    const total = mappedRows.reduce((sum, r) => sum + r.lineTotal, 0);
    return { orderCount: orderIds.size, itemCount: mappedRows.length, total };
  }, [mappedRows]);

  async function handleImport() {
    if (mappedRows.length === 0) {
      toast.error("Map the required fields first.");
      return;
    }
    setImporting(true);
    try {
      const result = await importMarketplaceOrders(channel, mappedRows, status);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Imported ${result.imported} order${result.imported === 1 ? "" : "s"}${result.skipped ? ` — ${result.skipped} already imported, skipped` : ""}.`);
      setHeader([]);
      setDataRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push("/admin/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <h3 className="font-display text-lg text-charcoal">1. Choose channel and file</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="import-channel">Marketplace</Label>
              <Select value={channel} onValueChange={handleChannelChange}>
                <SelectTrigger id="import-channel" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="import-file">Orders CSV export</Label>
              <input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="flex h-10 w-64 items-center rounded-full border border-border bg-warm-white px-4 text-sm text-charcoal file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1 file:text-xs file:font-medium"
              />
            </div>
          </div>
          <p className="text-xs text-muted">
            Export your orders as CSV from the {CHANNELS.find((c) => c.value === channel)?.label} seller dashboard,
            then upload it here. Column names don&apos;t need to match — you&apos;ll map them next.
          </p>
        </CardContent>
      </Card>

      {header.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h3 className="font-display text-lg text-charcoal">2. Map columns</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {REQUIRED_IMPORT_FIELDS.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`map-${field.key}`}>
                    {field.label}
                    {field.required && <span className="text-tangerine-600"> *</span>}
                  </Label>
                  <Select
                    value={mapping[field.key] || UNMAPPED}
                    onValueChange={(value) => updateMapping(field.key, value)}
                  >
                    <SelectTrigger id={`map-${field.key}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNMAPPED}>— Not mapped —</SelectItem>
                      {header.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {header.length > 0 && requiredMapped && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h3 className="font-display text-lg text-charcoal">3. Preview and import</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-beige p-4">
                <p className="text-xs text-muted">Orders</p>
                <p className="mt-1 text-xl font-semibold text-charcoal">{preview.orderCount}</p>
              </div>
              <div className="rounded-2xl bg-beige p-4">
                <p className="text-xs text-muted">Order lines</p>
                <p className="mt-1 text-xl font-semibold text-charcoal">{preview.itemCount}</p>
              </div>
              <div className="rounded-2xl bg-beige p-4">
                <p className="text-xs text-muted">Total value</p>
                <p className="mt-1 text-xl font-semibold text-charcoal">{formatINR(preview.total)}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappedRows.slice(0, 10).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.externalOrderId}</TableCell>
                      <TableCell>{r.customerName}</TableCell>
                      <TableCell>{r.state}</TableCell>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell>{formatINR(r.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {mappedRows.length > 10 && (
              <p className="text-xs text-muted">...and {mappedRows.length - 10} more rows.</p>
            )}

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label htmlFor="import-status">Order status for this batch</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ImportOrderStatus)}>
                  <SelectTrigger id="import-status" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="accent" onClick={handleImport} disabled={importing}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {importing ? "Importing..." : `Import ${preview.orderCount} orders`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
