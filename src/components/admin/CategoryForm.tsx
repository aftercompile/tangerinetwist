"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validation/category";
import { createCategory, updateCategory } from "@/lib/actions/category-actions";

const emptyValues: CategoryFormValues = {
  slug: "",
  name: "",
  shortName: "",
  tagline: "",
  description: "",
  heroIcon: "",
  material: "",
};

export function CategoryForm({
  initialValues,
  onSaved,
  onCancel,
}: {
  initialValues?: CategoryFormValues;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = React.useState<CategoryFormValues>(initialValues ?? emptyValues);
  const [submitting, setSubmitting] = React.useState(false);
  const mode = initialValues ? "edit" : "create";

  function update<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = categoryFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the errors and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === "create" ? await createCategory(parsed.data) : await updateCategory(parsed.data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(mode === "create" ? "Category created" : "Category updated");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          value={values.name}
          onChange={(e) => {
            update("name", e.target.value);
            if (mode === "create") update("slug", slugify(e.target.value));
          }}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cat-slug">Slug</Label>
          <Input id="cat-slug" value={values.slug} onChange={(e) => update("slug", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="cat-shortName">Short Name</Label>
          <Input
            id="cat-shortName"
            value={values.shortName}
            onChange={(e) => update("shortName", e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="cat-tagline">Tagline</Label>
        <Input id="cat-tagline" value={values.tagline} onChange={(e) => update("tagline", e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="cat-description">Description</Label>
        <Textarea
          id="cat-description"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cat-heroIcon">Hero Icon Key</Label>
          <Input
            id="cat-heroIcon"
            value={values.heroIcon}
            onChange={(e) => update("heroIcon", e.target.value)}
            placeholder="lamp"
            required
          />
        </div>
        <div>
          <Label htmlFor="cat-material">Material</Label>
          <Input id="cat-material" value={values.material} onChange={(e) => update("material", e.target.value)} required />
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create Category" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
