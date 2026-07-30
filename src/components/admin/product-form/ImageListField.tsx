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
import { iconMap } from "@/components/shared/icon-map";
import { compressImageFile } from "@/lib/image-compress";
import type { ProductFormInternal } from "./form-types";

const iconNames = Object.keys(iconMap);
const tones = ["warm", "cool", "charcoal", "beige"] as const;

export function ImageListField() {
  const { control, register, watch, setValue } = useFormContext<ProductFormInternal>();
  const { fields, append, remove } = useFieldArray({ control, name: "images" });
  const [uploadingIndex, setUploadingIndex] = React.useState<number | null>(null);

  async function handleUpload(index: number, file: File) {
    setUploadingIndex(index);
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });

      // A body that's still too large can be rejected by the hosting platform itself
      // (e.g. Vercel's ~4.5MB request limit) with a plain-text error before this route's
      // own code ever runs, so the response isn't guaranteed to be JSON — never assume it is.
      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error(
          res.ok ? "Upload succeeded but the response was unreadable." : `Upload failed (server said: ${res.status}).`
        );
      }

      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setValue(`images.${index}.src`, data.url, { shouldValidate: true });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingIndex(null);
    }
  }

  return (
    <div>
      <Label>Images</Label>
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const src = watch(`images.${index}.src`);
          const tone = watch(`images.${index}.tone`);
          const icon = watch(`images.${index}.icon`);
          const Icon = iconMap[icon] ?? iconMap.Sparkles;

          return (
            <div key={field.id} className="flex gap-4 rounded-2xl border border-border p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-beige">
                {src ? (
                  <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon className="h-8 w-8 text-muted" />
                  </div>
                )}
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="flex h-10 w-fit cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-xs font-medium text-charcoal transition hover:border-charcoal">
                    {uploadingIndex === index ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {src ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(index, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <Input placeholder="Alt text" {...register(`images.${index}.alt` as const)} />

                <Select value={tone} onValueChange={(v) => setValue(`images.${index}.tone`, v as (typeof tones)[number])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={icon} onValueChange={(v) => setValue(`images.${index}.icon`, v)}>
                  <SelectTrigger className="sm:col-span-2">
                    <SelectValue placeholder="Fallback icon" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {iconNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove image"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-beige hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => append({ src: "", alt: "", tone: "beige", icon: "Sparkles" })}
      >
        <Plus className="h-3.5 w-3.5" /> Add image
      </Button>
    </div>
  );
}
