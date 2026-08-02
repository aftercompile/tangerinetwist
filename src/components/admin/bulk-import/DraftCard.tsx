"use client";

import Image from "next/image";
import { Loader2, RotateCcw, Sparkles, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminCategoryOption } from "@/lib/db/admin-queries";
import type { BulkImportRow } from "./types";

export function DraftCard({
  row,
  categories,
  priceRanges,
  onChange,
  onPublish,
  onRetry,
}: {
  row: BulkImportRow;
  categories: AdminCategoryOption[];
  priceRanges: Record<string, { min: number; max: number }>;
  onChange: (patch: Partial<BulkImportRow>) => void;
  onPublish: () => void;
  onRetry: () => void;
}) {
  const range = row.categorySlug ? priceRanges[row.categorySlug] : undefined;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-beige sm:h-auto sm:w-40">
          {row.imageUrl && <Image src={row.imageUrl} alt="" fill sizes="160px" className="object-cover" />}
          {row.status === "uploading" || row.status === "generating" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : null}
          {row.status === "published" && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60">
              <Check className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <p className="text-xs text-muted">{row.fileName}</p>

          {row.status === "uploading" && <p className="text-sm text-muted">Uploading…</p>}
          {row.status === "generating" && <p className="text-sm text-muted">Drafting listing with Gemma…</p>}

          {row.status === "error" && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2">
              <p className="text-sm text-red-700">{row.error}</p>
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          )}

          {row.status === "published" && (
            <p className="text-sm font-medium text-charcoal">Published as &quot;{row.name}&quot;</p>
          )}

          {(row.status === "ready" || row.status === "publishing") && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input value={row.name} onChange={(e) => onChange({ name: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={row.categorySlug} onValueChange={(v) => onChange({ categorySlug: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Tagline</Label>
                <Input value={row.tagline} onChange={(e) => onChange({ tagline: e.target.value })} />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={row.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label>Material</Label>
                  <Input value={row.material} onChange={(e) => onChange({ material: e.target.value })} />
                </div>
                <div>
                  <Label>Colorway</Label>
                  <Input value={row.colorway} onChange={(e) => onChange({ colorway: e.target.value })} />
                </div>
                <div>
                  <Label>
                    Price (₹){range ? ` — range ₹${range.min}–${range.max}` : ""}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={row.price}
                    onChange={(e) => onChange({ price: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Required by the product schema but never AI-guessed — a photo can't tell
                  you exact physical measurements. Left blank until the admin fills them in. */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Dimensions *</Label>
                  <Input
                    placeholder="e.g. 14 cm (D) × 22 cm (H)"
                    value={row.dimensions}
                    onChange={(e) => onChange({ dimensions: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Weight *</Label>
                  <Input
                    placeholder="e.g. 420 g"
                    value={row.weight}
                    onChange={(e) => onChange({ weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Sparkles className="h-3.5 w-3.5" /> Drafted — review before publishing
                </p>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={!row.dimensions.trim() || !row.weight.trim() || row.status === "publishing"}
                  onClick={onPublish}
                >
                  {row.status === "publishing" ? "Publishing…" : "Publish"}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
