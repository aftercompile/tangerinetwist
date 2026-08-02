"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { compressImageFile } from "@/lib/image-compress";
import { generateDraftFromImage, getBulkImportDefaults } from "@/lib/actions/bulk-import-actions";
import { createProduct } from "@/lib/actions/product-actions";
import { slugify } from "@/lib/utils";
import { DraftCard } from "./DraftCard";
import type { BulkImportRow } from "./types";
import type { AdminCategoryOption, AdminProductRow } from "@/lib/db/admin-queries";

const CATEGORY_TONE: Record<string, "warm" | "cool" | "charcoal" | "beige"> = {
  lamps: "warm",
  idols: "charcoal",
  "desk-organizers": "cool",
};

function randomId(): string {
  return Math.random().toString(36).slice(2);
}

function emptyRow(fileName: string, defaultCategorySlug: string): BulkImportRow {
  return {
    tempId: randomId(),
    fileName,
    imageUrl: "",
    status: "uploading",
    name: "",
    tagline: "",
    description: "",
    story: "",
    categorySlug: defaultCategorySlug,
    material: "",
    materials: [],
    colorway: "",
    features: [],
    suggestedIcon: "Sparkles",
    price: 0,
    dimensions: "",
    weight: "",
  };
}

export function BulkImportClient({
  categories,
  productRows,
}: {
  categories: AdminCategoryOption[];
  productRows: AdminProductRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = React.useState<BulkImportRow[]>([]);
  const [processing, setProcessing] = React.useState(false);

  const priceRanges = React.useMemo(() => {
    const ranges: Record<string, { min: number; max: number }> = {};
    for (const p of productRows) {
      const existing = ranges[p.categorySlug];
      if (!existing) ranges[p.categorySlug] = { min: p.price, max: p.price };
      else {
        existing.min = Math.min(existing.min, p.price);
        existing.max = Math.max(existing.max, p.price);
      }
    }
    return ranges;
  }, [productRows]);

  function updateRow(tempId: string, patch: Partial<BulkImportRow>) {
    setRows((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, ...patch } : r)));
  }

  async function draftFor(tempId: string, imageUrl: string) {
    updateRow(tempId, { status: "generating", error: undefined });
    const result = await generateDraftFromImage(imageUrl);
    if (result.error || !result.draft) {
      updateRow(tempId, { status: "error", error: result.error ?? "Draft generation failed" });
      return;
    }
    const d = result.draft;
    updateRow(tempId, {
      status: "ready",
      name: d.name,
      tagline: d.tagline,
      description: d.description,
      story: d.story,
      categorySlug: d.categorySlug,
      material: d.material,
      materials: d.materials,
      colorway: d.colorway,
      features: d.features,
      suggestedIcon: d.suggestedIcon,
      price: d.suggestedPrice,
    });
  }

  async function processFile(tempId: string, file: File) {
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData: { url?: string; error?: string } | null = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadData?.url) {
        throw new Error(uploadData?.error ?? "Upload failed");
      }
      updateRow(tempId, { imageUrl: uploadData.url });
      await draftFor(tempId, uploadData.url);
    } catch (err) {
      updateRow(tempId, { status: "error", error: err instanceof Error ? err.message : "Something went wrong" });
    }
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const defaultCategorySlug = categories[0]?.slug ?? "";
    const newRows = files.map((file) => emptyRow(file.name, defaultCategorySlug));

    setRows((prev) => [...prev, ...newRows]);
    setProcessing(true);
    await Promise.allSettled(newRows.map((row, i) => processFile(row.tempId, files[i])));
    setProcessing(false);
  }

  function retryRow(tempId: string) {
    const row = rows.find((r) => r.tempId === tempId);
    if (!row?.imageUrl) return;
    draftFor(tempId, row.imageUrl);
  }

  async function publishRow(tempId: string) {
    const row = rows.find((r) => r.tempId === tempId);
    if (!row) return;

    const category = categories.find((c) => c.slug === row.categorySlug);
    if (!category) {
      toast.error("Unknown category");
      return;
    }

    updateRow(tempId, { status: "publishing" });
    try {
      const defaults = await getBulkImportDefaults(row.categorySlug);
      const tone = CATEGORY_TONE[row.categorySlug] ?? "beige";

      const result = await createProduct({
        slug: slugify(row.name),
        categoryId: category.id,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        story: row.story,
        price: row.price,
        compareAtPrice: null,
        material: row.material,
        materials: row.materials,
        dimensions: row.dimensions,
        weight: row.weight,
        colorway: row.colorway,
        finishTime: "Hand-finished to order",
        icon: row.suggestedIcon,
        badges: [],
        features: row.features,
        careInstructions: defaults.careInstructions,
        shippingInfo: defaults.shippingInfo,
        returnPolicy: defaults.returnPolicy,
        faqs: defaults.faqs,
        stock: "in-stock",
        isPersonalized: false,
        images: [{ src: row.imageUrl, alt: row.name, tone, icon: row.suggestedIcon }],
        relatedProductIds: [],
      });

      if (result.error) {
        updateRow(tempId, { status: "ready" });
        toast.error(result.error);
        return;
      }

      updateRow(tempId, { status: "published" });
      toast.success(`"${row.name}" published`);
      router.refresh();
    } catch (err) {
      updateRow(tempId, { status: "ready" });
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-charcoal transition hover:border-charcoal">
        <Upload className="h-4 w-4" />
        Select photos
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          disabled={processing}
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {rows.length === 0 && (
        <p className="text-sm text-muted">
          Select one or more product photos to get AI-drafted listings. Nothing is published until
          you review and click Publish on each one.
        </p>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <DraftCard
              key={row.tempId}
              row={row}
              categories={categories}
              priceRanges={priceRanges}
              onChange={(patch) => updateRow(row.tempId, patch)}
              onPublish={() => publishRow(row.tempId)}
              onRetry={() => retryRow(row.tempId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
