"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { AdminProductOption } from "@/lib/db/admin-queries";
import type { ProductFormInternal } from "./form-types";

export function RelatedProductsField({ options }: { options: AdminProductOption[] }) {
  const { watch, setValue } = useFormContext<ProductFormInternal>();
  const selected = watch("relatedProductIds");

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    setValue("relatedProductIds", next, { shouldValidate: true });
  }

  return (
    <div>
      <Label>Related Products</Label>
      <p className="mb-3 text-xs text-muted">Shown as &ldquo;You may also like&rdquo; on the product page.</p>
      <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto rounded-2xl border border-border p-3 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-charcoal hover:bg-beige"
          >
            <Checkbox checked={selected.includes(opt.id)} onCheckedChange={() => toggle(opt.id)} />
            {opt.name}
          </label>
        ))}
      </div>
    </div>
  );
}
