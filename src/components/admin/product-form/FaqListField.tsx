"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ProductFormInternal } from "./form-types";

export function FaqListField() {
  const { control, register } = useFormContext<ProductFormInternal>();
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

  return (
    <div>
      <Label>FAQs</Label>
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 rounded-2xl border border-border p-4">
            <div className="flex flex-1 flex-col gap-2">
              <Input placeholder="Question" {...register(`faqs.${index}.question` as const)} />
              <Textarea placeholder="Answer" rows={2} {...register(`faqs.${index}.answer` as const)} />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label="Remove FAQ"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-beige hover:text-charcoal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ question: "", answer: "" })}
      >
        <Plus className="h-3.5 w-3.5" /> Add FAQ
      </Button>
    </div>
  );
}
