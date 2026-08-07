"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { compressImageFile } from "@/lib/image-compress";
import { generateDraftFromImage, getBulkImportDefaults } from "@/lib/actions/bulk-import-actions";
import { createProduct } from "@/lib/actions/product-actions";
import { runWithLimit } from "@/lib/concurrency";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DraftCard } from "./DraftCard";
import type { BulkImportRow } from "./types";
import type { AdminCategoryOption, AdminProductRow } from "@/lib/db/admin-queries";
import type { ProductBadge } from "@/lib/types";

const CATEGORY_TONE: Record<string, "warm" | "cool" | "charcoal" | "beige"> = {
  lamps: "warm",
  idols: "charcoal",
  "desk-organizers": "cool",
};

// Selecting a large batch of photos used to fire an upload + a Gemini vision call per photo
// all at once (Promise.allSettled with no cap) — this bounds it via runWithLimit instead.
const UPLOAD_CONCURRENCY = 4;
const STORAGE_KEY = "bulk-import-drafts";

function randomId(): string {
  return Math.random().toString(36).slice(2);
}

function emptyRow(fileName: string, defaultCategorySlug: string): BulkImportRow {
  return {
    tempId: randomId(),
    fileName,
    images: [],
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
    badges: [],
  };
}

function isRowReady(row: BulkImportRow): boolean {
  return row.status === "ready" && row.images.length > 0 && !!row.dimensions.trim() && !!row.weight.trim();
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
  const hasHydrated = React.useRef(false);

  // Restores drafted-but-unpublished rows after an accidental refresh. Only rows that
  // reached "ready"/"error" (i.e. already have at least one uploaded photo) are meaningfully
  // restorable — anything still mid-upload/mid-draft/mid-publish loses its in-flight File or
  // fetch along with the page and can't be resumed, so those are just dropped. A single
  // effect (not two) reading then writing avoids a race where an unguarded write-on-mount
  // would overwrite storage with the still-empty initial `rows` before the restored data
  // makes it into state.
  React.useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: BulkImportRow[] = JSON.parse(raw);
          const restorable = saved.filter(
            (r) => r.images.length > 0 && (r.status === "ready" || r.status === "error")
          );
          if (restorable.length > 0) {
            setRows(restorable);
            return;
          }
        }
      } catch {
        // Corrupt/unavailable storage — just start fresh.
      }
      return;
    }

    try {
      const persistable = rows.filter((r) => r.status === "ready" || r.status === "error");
      if (persistable.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage full/unavailable — not critical, just skip persisting this update.
    }
  }, [rows]);

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
      updateRow(tempId, { images: [uploadData.url] });
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
    await runWithLimit(newRows, UPLOAD_CONCURRENCY, (row, i) => processFile(row.tempId, files[i]));
    setProcessing(false);
  }

  // Attaches an additional photo to an already-drafted row — uses its own `uploadingExtra`
  // flag rather than `status` so it doesn't reset the drafted copy back into a loading view.
  async function addPhotoToRow(tempId: string, file: File) {
    updateRow(tempId, { uploadingExtra: true });
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData: { url?: string; error?: string } | null = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadData?.url) {
        throw new Error(uploadData?.error ?? "Upload failed");
      }
      const row = rows.find((r) => r.tempId === tempId);
      updateRow(tempId, { images: [...(row?.images ?? []), uploadData.url] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add photo");
    } finally {
      updateRow(tempId, { uploadingExtra: false });
    }
  }

  function removePhotoFromRow(tempId: string, index: number) {
    const row = rows.find((r) => r.tempId === tempId);
    if (!row) return;
    updateRow(tempId, { images: row.images.filter((_, i) => i !== index) });
  }

  function retryRow(tempId: string) {
    const row = rows.find((r) => r.tempId === tempId);
    if (!row?.images[0]) return;
    draftFor(tempId, row.images[0]);
  }

  function applyToAll(patch: { categorySlug?: string; badges?: ProductBadge[] }) {
    setRows((prev) => prev.map((r) => (r.status === "ready" ? { ...r, ...patch } : r)));
    toast.success("Applied to all draft rows");
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
        badges: row.badges,
        features: row.features,
        careInstructions: defaults.careInstructions,
        shippingInfo: defaults.shippingInfo,
        returnPolicy: defaults.returnPolicy,
        faqs: defaults.faqs,
        stock: "in-stock",
        isPersonalized: false,
        images: row.images.map((src) => ({ src, alt: row.name, tone, icon: row.suggestedIcon })),
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

  async function publishAllReady() {
    const readyRows = rows.filter(isRowReady);
    if (readyRows.length === 0) return;
    await runWithLimit(readyRows, UPLOAD_CONCURRENCY, (row) => publishRow(row.tempId));
  }

  const readyCount = rows.filter(isRowReady).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
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

        {rows.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyToAll({ categorySlug: rows[0].categorySlug, badges: rows[0].badges })}
          >
            Apply first row&apos;s category &amp; tags to all
          </Button>
        )}

        {readyCount > 1 && (
          <Button type="button" variant="accent" size="sm" onClick={publishAllReady}>
            Publish All ({readyCount})
          </Button>
        )}
      </div>

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
              onAddPhoto={(file) => addPhotoToRow(row.tempId, file)}
              onRemovePhoto={(index) => removePhotoFromRow(row.tempId, index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
