"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { iconMap } from "@/components/shared/icon-map";
import { slugify } from "@/lib/utils";
import { badgeOptions } from "@/lib/badges";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";
import type { AdminCategoryOption, AdminProductOption } from "@/lib/db/admin-queries";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/product-actions";
import { StringListField } from "./StringListField";
import { ImageListField } from "./ImageListField";
import { FaqListField } from "./FaqListField";
import { RelatedProductsField } from "./RelatedProductsField";
import { toInternal, fromInternal, emptyProductFormValues, type ProductFormInternal } from "./form-types";

const iconNames = Object.keys(iconMap);

const TABS = ["basics", "pricing", "specs", "media", "copy", "related"] as const;

// Maps a zod issue's top-level field name to the tab it's edited on, so a failed
// submit can jump the user straight to the problem instead of leaving them to hunt
// across six tabs for whichever field the first error happened to land on.
const FIELD_TAB: Record<string, (typeof TABS)[number]> = {
  slug: "basics",
  categoryId: "basics",
  name: "basics",
  tagline: "basics",
  description: "basics",
  story: "basics",
  price: "pricing",
  compareAtPrice: "pricing",
  stock: "pricing",
  badges: "pricing",
  isPersonalized: "pricing",
  material: "specs",
  materials: "specs",
  dimensions: "specs",
  weight: "specs",
  colorway: "specs",
  finishTime: "specs",
  icon: "specs",
  features: "specs",
  images: "media",
  careInstructions: "copy",
  shippingInfo: "copy",
  returnPolicy: "copy",
  faqs: "copy",
  relatedProductIds: "related",
};

export function ProductForm({
  mode,
  initialValues,
  categories,
  productOptions,
}: {
  mode: "create" | "edit";
  initialValues?: ProductFormValues;
  categories: AdminCategoryOption[];
  productOptions: AdminProductOption[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>("basics");

  const methods = useForm<ProductFormInternal>({
    defaultValues: toInternal(initialValues ?? emptyProductFormValues),
  });
  const { register, handleSubmit, watch, setValue, formState } = methods;

  const slug = watch("slug");
  const badges = watch("badges");
  const isPersonalized = watch("isPersonalized");
  const categoryId = watch("categoryId");
  const stock = watch("stock");
  const icon = watch("icon");

  function regenerateSlug() {
    const name = watch("name");
    if (name) setValue("slug", slugify(name), { shouldValidate: true });
  }

  function toggleBadge(value: (typeof badgeOptions)[number]["value"]) {
    const next = badges.includes(value) ? badges.filter((b) => b !== value) : [...badges, value];
    setValue("badges", next);
  }

  async function onSubmit(internal: ProductFormInternal) {
    const values: ProductFormValues = fromInternal(internal);
    const parsed = productFormSchema.safeParse(values);
    if (!parsed.success) {
      const issues = parsed.error.issues;
      const firstField = String(issues[0]?.path[0] ?? "");
      const tab = FIELD_TAB[firstField];
      if (tab) setActiveTab(tab);

      // Surface every distinct problem at once — with six tabs' worth of fields,
      // showing only the first error meant fixing one just revealed the next.
      const messages = Array.from(new Set(issues.map((i) => i.message)));
      const preview = messages.slice(0, 4).join("\n");
      const suffix = messages.length > 4 ? `\n+${messages.length - 4} more` : "";
      toast.error(preview + suffix || "Please fix the errors and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const result =
        mode === "create"
          ? await createProduct(parsed.data)
          : await updateProduct({ ...parsed.data, id: initialValues?.id });

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(mode === "create" ? "Product created" : "Product updated");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      // createProduct/updateProduct only return a friendly {error} for a slug
      // collision — anything else (an expired session, a stale category
      // reference, a transient DB error) throws instead. Without this catch
      // that exception was an unhandled rejection: the button re-enabled via
      // `finally` below but nothing else happened, which from the admin's side
      // looked exactly like the button didn't do anything at all.
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!initialValues?.id) return;
    if (!confirm(`Delete "${initialValues.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const result = await deleteProduct(initialValues.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Product deleted");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as (typeof TABS)[number])}>
          <TabsList>
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="pricing">Pricing &amp; Inventory</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="copy">Copy</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="flex flex-col gap-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <div className="flex gap-2">
                <Input id="slug" {...register("slug")} required />
                <Button type="button" variant="outline" size="icon" onClick={regenerateSlug} aria-label="Generate slug from name">
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              {slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && (
                <p className="mt-1 text-xs text-red-600">Use lowercase letters, numbers and hyphens only.</p>
              )}
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select value={categoryId} onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register("tagline")} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} required />
            </div>
            <div>
              <Label htmlFor="story">Story</Label>
              <Textarea id="story" rows={4} {...register("story")} required />
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" min={1} {...register("price")} required />
              </div>
              <div>
                <Label htmlFor="compareAtPrice">Compare-at Price (₹)</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  min={1}
                  {...register("compareAtPrice", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="stock">Stock Status</Label>
              <Select value={stock} onValueChange={(v) => setValue("stock", v as ProductFormValues["stock"])}>
                <SelectTrigger id="stock">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="made-to-order">Made to Order</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Badges</Label>
              <div className="flex flex-wrap gap-4">
                {badgeOptions.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                    <Checkbox
                      checked={badges.includes(opt.value)}
                      onCheckedChange={() => toggleBadge(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3">
              <Switch checked={isPersonalized} onCheckedChange={(v) => setValue("isPersonalized", v)} />
              <span className="text-sm text-charcoal">Allow personalization text at checkout</span>
            </label>
          </TabsContent>

          <TabsContent value="specs" className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="material">Primary Material</Label>
                <Input id="material" {...register("material")} required />
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" {...register("dimensions")} required />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" {...register("weight")} required />
              </div>
              <div>
                <Label htmlFor="colorway">Colorway</Label>
                <Input id="colorway" {...register("colorway")} required />
              </div>
              <div>
                <Label htmlFor="finishTime">Finish Time</Label>
                <Input id="finishTime" {...register("finishTime")} required />
              </div>
              <div>
                <Label htmlFor="icon">Default Icon</Label>
                <Select value={icon} onValueChange={(v) => setValue("icon", v)}>
                  <SelectTrigger id="icon">
                    <SelectValue />
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
            </div>
            <StringListField name="materials" label="Materials" placeholder="e.g. Premium PLA shell" />
            <StringListField name="features" label="Features" placeholder="e.g. Diffused, flicker-free warm-white glow" />
          </TabsContent>

          <TabsContent value="media">
            <ImageListField />
          </TabsContent>

          <TabsContent value="copy" className="flex flex-col gap-6">
            <StringListField name="careInstructions" label="Care Instructions" />
            <StringListField name="shippingInfo" label="Shipping Info" />
            <StringListField name="returnPolicy" label="Return Policy" />
            <FaqListField />
          </TabsContent>

          <TabsContent value="related">
            <RelatedProductsField options={productOptions} />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between border-t border-border pt-6">
          <div>
            {mode === "edit" && (
              <Button type="button" variant="outline" onClick={onDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Product"}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting || formState.isSubmitting}>
              {submitting ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
