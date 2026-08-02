import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCategoryOptions, getAdminProductRows } from "@/lib/db/admin-queries";
import { BulkImportClient } from "@/components/admin/bulk-import/BulkImportClient";

// Same reasoning as every other admin data page — nothing here should ever be
// frozen at build time.
export const dynamic = "force-dynamic";

export default async function BulkImportPage() {
  const [categories, productRows] = await Promise.all([getAdminCategoryOptions(), getAdminProductRows()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
        </Link>
        <h2 className="mt-2 h-display text-2xl">Bulk Import</h2>
        <p className="mt-1 text-sm text-muted">
          Upload product photos and get AI-drafted listings (Gemma 4 26B) to review before
          publishing. Dimensions and weight always need a manual check — a photo can&apos;t tell
          us those.
        </p>
      </div>
      <BulkImportClient categories={categories} productRows={productRows} />
    </div>
  );
}
