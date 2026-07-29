import { notFound } from "next/navigation";
import { getAdminCategoryOptions, getAdminProductById, getAdminProductOptions } from "@/lib/db/admin-queries";
import { ProductForm } from "@/components/admin/product-form/ProductForm";
import type { ProductFormValues } from "@/lib/validation/product";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const detail = await getAdminProductById(params.id);
  if (!detail) notFound();

  const [categories, productOptions] = await Promise.all([
    getAdminCategoryOptions(),
    getAdminProductOptions(params.id),
  ]);

  const initialValues: ProductFormValues = {
    id: detail.id,
    slug: detail.slug,
    categoryId: detail.categoryId,
    name: detail.name,
    tagline: detail.tagline,
    description: detail.description,
    story: detail.story,
    price: detail.price,
    compareAtPrice: detail.compareAtPrice,
    material: detail.material,
    materials: detail.materials,
    dimensions: detail.dimensions,
    weight: detail.weight,
    colorway: detail.colorway,
    finishTime: detail.finishTime,
    icon: detail.icon,
    badges: detail.badges as ProductFormValues["badges"],
    features: detail.features,
    careInstructions: detail.careInstructions,
    shippingInfo: detail.shippingInfo,
    returnPolicy: detail.returnPolicy,
    faqs: detail.faqs,
    stock: detail.stock,
    isPersonalized: detail.isPersonalized,
    images: detail.images.map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt,
      tone: img.tone,
      icon: img.icon,
    })),
    relatedProductIds: detail.relatedProductIds,
  };

  return (
    <ProductForm
      mode="edit"
      initialValues={initialValues}
      categories={categories}
      productOptions={productOptions}
    />
  );
}
