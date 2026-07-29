import { getAdminCategoryOptions, getAdminProductOptions } from "@/lib/db/admin-queries";
import { ProductForm } from "@/components/admin/product-form/ProductForm";

export default async function NewProductPage() {
  const [categories, productOptions] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminProductOptions(),
  ]);

  return <ProductForm mode="create" categories={categories} productOptions={productOptions} />;
}
