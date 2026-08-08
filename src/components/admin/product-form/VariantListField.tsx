"use client";

import * as React from "react";
import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { compressImageFile } from "@/lib/image-compress";
import type { ProductFormInternal } from "./form-types";

// Mirrors ImageListField.tsx's per-slot compress -> POST /api/admin/upload -> setValue
// pattern, one level deeper: each variant gets its own nested image field array
// (variants.${index}.images) instead of one shared per-product list.
export function VariantListField() {
  const { control } = useFormContext<ProductFormInternal>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  return (
    <div>
      <Label>Variants</Label>
      <p className="mb-3 text-xs text-muted">
        Add a size and/or color option. Leave price blank to use the product&apos;s own price;
        leave photos empty to fall back to the product&apos;s shared photos.
      </p>
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <VariantCard key={field.id} index={index} onRemove={() => remove(index)} />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() =>
          append({ size: "", color: "", sku: "", price: undefined, stock: "in-stock", images: [] })
        }
      >
        <Plus className="h-3.5 w-3.5" /> Add variant
      </Button>
    </div>
  );
}

function VariantCard({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { control, register, watch, setValue } = useFormContext<ProductFormInternal>();
  const { fields, append, remove } = useFieldArray({ control, name: `variants.${index}.images` });
  const [uploadingSlot, setUploadingSlot] = React.useState<number | null>(null);
  const stock = watch(`variants.${index}.stock`);

  async function handleUpload(imgIndex: number, file: File) {
    setUploadingSlot(imgIndex);
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });

      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error(
          res.ok ? "Upload succeeded but the response was unreadable." : `Upload failed (server said: ${res.status}).`
        );
      }

      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setValue(`variants.${index}.images.${imgIndex}.src`, data.url, { shouldValidate: true });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label htmlFor={`variant-${index}-size`}>Size</Label>
            <Input id={`variant-${index}-size`} placeholder="e.g. Large" {...register(`variants.${index}.size`)} />
          </div>
          <div>
            <Label htmlFor={`variant-${index}-color`}>Color</Label>
            <Input id={`variant-${index}-color`} placeholder="e.g. Red" {...register(`variants.${index}.color`)} />
          </div>
          <div>
            <Label htmlFor={`variant-${index}-price`}>Price override (₹)</Label>
            <Input
              id={`variant-${index}-price`}
              type="number"
              min={1}
              placeholder="Same as product"
              {...register(`variants.${index}.price`, {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
          </div>
          <div>
            <Label htmlFor={`variant-${index}-stock`}>Stock</Label>
            <Select
              value={stock}
              onValueChange={(v) => setValue(`variants.${index}.stock`, v as "in-stock" | "made-to-order" | "low-stock")}
            >
              <SelectTrigger id={`variant-${index}-stock`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="made-to-order">Made to Order</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

      <div className="mt-3 flex flex-wrap gap-2">
        {fields.map((imgField, imgIndex) => {
          const src = watch(`variants.${index}.images.${imgIndex}.src`);
          return (
            <div key={imgField.id} className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-beige">
              {src ? (
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              ) : uploadingSlot === imgIndex ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted" />
                </div>
              ) : (
                <label className="flex h-full w-full cursor-pointer items-center justify-center">
                  <Upload className="h-4 w-4 text-muted" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(imgIndex, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              <button
                type="button"
                onClick={() => remove(imgIndex)}
                aria-label="Remove photo"
                className="absolute inset-0 flex items-center justify-center bg-charcoal/60 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          );
        })}
        <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted transition hover:border-charcoal hover:text-charcoal">
          <Plus className="h-4 w-4" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                append({ src: "", alt: "", tone: "beige", icon: "Sparkles" });
                handleUpload(fields.length, file);
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
