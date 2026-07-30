import { getAdminCategoryOptions, getAdminProductOptions } from "@/lib/db/admin-queries";
import { ProductForm } from "@/components/admin/product-form/ProductForm";

// Categories/products offered in this form (category select, related-products list)
// must reflect anything created moments ago, not a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, productOptions] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminProductOptions(),
  ]);

  return <ProductForm mode="create" categories={categories} productOptions={productOptions} />;
}
