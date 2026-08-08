"use client";

import Image from "next/image";
import { Loader2, RotateCcw, Sparkles, Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { badgeOptions } from "@/lib/badges";
import type { AdminCategoryOption } from "@/lib/db/admin-queries";
import type { ProductBadge } from "@/lib/types";
import type { BulkImportRow, BulkImportVariant } from "./types";

export function DraftCard({
  row,
  categories,
  priceRanges,
  onChange,
  onPublish,
  onRetry,
  onAddPhoto,
  onRemovePhoto,
  onAddVariant,
  onRemoveVariant,
  onChangeVariant,
}: {
  row: BulkImportRow;
  categories: AdminCategoryOption[];
  priceRanges: Record<string, { min: number; max: number }>;
  onChange: (patch: Partial<BulkImportRow>) => void;
  onPublish: () => void;
  onRetry: () => void;
  // variantIndex omitted targets the row's own photos; given, targets that one variant's.
  onAddPhoto: (file: File, variantIndex?: number) => void;
  onRemovePhoto: (index: number, variantIndex?: number) => void;
  onAddVariant: () => void;
  onRemoveVariant: (variantIndex: number) => void;
  onChangeVariant: (variantIndex: number, patch: Partial<BulkImportVariant>) => void;
}) {
  const range = row.categorySlug ? priceRanges[row.categorySlug] : undefined;
  const editable = row.status === "ready" || row.status === "publishing";

  function toggleBadge(value: ProductBadge) {
    const next = row.badges.includes(value) ? row.badges.filter((b) => b !== value) : [...row.badges, value];
    onChange({ badges: next });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-40">
          <div className="group relative h-40 w-full overflow-hidden rounded-xl bg-beige">
            {row.images[0] && <Image src={row.images[0]} alt="" fill sizes="160px" className="object-cover" />}
            {(row.status === "uploading" || row.status === "generating") && (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            {row.status === "published" && (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60">
                <Check className="h-8 w-8 text-white" />
              </div>
            )}
            {editable && row.images.length > 0 && (
              <button
                type="button"
                onClick={() => onRemovePhoto(0)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-white opacity-0 transition-opacity hover:bg-charcoal group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Additional photos beyond the first — the AI draft is only ever generated from
              images[0], so these are purely extra gallery shots for the product page. */}
          {editable && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {row.images.slice(1).map((src, i) => (
                <div key={src} className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-beige">
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(i + 1)}
                    aria-label="Remove photo"
                    className="absolute inset-0 flex items-center justify-center bg-charcoal/60 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              <label className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted transition hover:border-charcoal hover:text-charcoal">
                {row.uploadingExtra ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  disabled={row.uploadingExtra}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onAddPhoto(file);
                    e.target.value = "";
                  }}
                />
              </label>
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

          {editable && (
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

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {badgeOptions.map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                      <Checkbox checked={row.badges.includes(opt.value)} onCheckedChange={() => toggleBadge(opt.value)} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Variants (optional)</Label>
                <p className="mb-2 text-xs text-muted">
                  Add a size and/or color option, each with its own photo. Leave price blank to
                  use the price above.
                </p>
                <div className="flex flex-col gap-3">
                  {row.variants.map((variant, i) => (
                    <VariantRow
                      key={variant.tempId}
                      variant={variant}
                      onChange={(patch) => onChangeVariant(i, patch)}
                      onRemove={() => onRemoveVariant(i)}
                      onAddPhoto={(file) => onAddPhoto(file, i)}
                      onRemovePhoto={(index) => onRemovePhoto(index, i)}
                    />
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onAddVariant}>
                  <Plus className="h-3.5 w-3.5" /> Add variant
                </Button>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Sparkles className="h-3.5 w-3.5" /> Drafted — review before publishing
                </p>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={
                    !row.dimensions.trim() ||
                    !row.weight.trim() ||
                    row.images.length === 0 ||
                    row.status === "publishing"
                  }
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

function VariantRow({
  variant,
  onChange,
  onRemove,
  onAddPhoto,
  onRemovePhoto,
}: {
  variant: BulkImportVariant;
  onChange: (patch: Partial<BulkImportVariant>) => void;
  onRemove: () => void;
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (index: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          <Input placeholder="Size" value={variant.size} onChange={(e) => onChange({ size: e.target.value })} />
          <Input placeholder="Color" value={variant.color} onChange={(e) => onChange({ color: e.target.value })} />
          <Input
            type="number"
            min={1}
            placeholder="Price override"
            value={variant.price ?? ""}
            onChange={(e) => onChange({ price: e.target.value === "" ? undefined : Number(e.target.value) })}
          />
          <Select value={variant.stock} onValueChange={(v) => onChange({ stock: v as BulkImportVariant["stock"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="made-to-order">Made to Order</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove variant"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-beige hover:text-charcoal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {variant.images.map((src, i) => (
          <div key={src} className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">
            <Image src={src} alt="" fill sizes="48px" className="object-cover" />
            <button
              type="button"
              onClick={() => onRemovePhoto(i)}
              aria-label="Remove photo"
              className="absolute inset-0 flex items-center justify-center bg-charcoal/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        ))}
        <label className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted transition hover:border-charcoal hover:text-charcoal">
          {variant.uploadingExtra ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            disabled={variant.uploadingExtra}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAddPhoto(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
