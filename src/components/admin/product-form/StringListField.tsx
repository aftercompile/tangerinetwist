"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProductFormInternal } from "./form-types";

export function StringListField({
  name,
  label,
  placeholder,
}: {
  name: "materials" | "features" | "careInstructions" | "shippingInfo" | "returnPolicy";
  label: string;
  placeholder?: string;
}) {
  const { control, register } = useFormContext<ProductFormInternal>();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input {...register(`${name}.${index}.value` as const)} placeholder={placeholder} />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label="Remove"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-beige hover:text-charcoal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
        <Plus className="h-3.5 w-3.5" /> Add
      </Button>
    </div>
  );
}
