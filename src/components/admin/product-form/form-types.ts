import type { ProductFormValues } from "@/lib/validation/product";

// react-hook-form's useFieldArray keys array items by object identity, so plain string[]
// fields (materials, features, etc.) are wrapped as { value: string }[] for editing and
// flattened back to string[] just before validation/submit.
export type ProductFormInternal = Omit<
  ProductFormValues,
  "materials" | "features" | "careInstructions" | "shippingInfo" | "returnPolicy"
> & {
  materials: { value: string }[];
  features: { value: string }[];
  careInstructions: { value: string }[];
  shippingInfo: { value: string }[];
  returnPolicy: { value: string }[];
};

export function toInternal(values: ProductFormValues): ProductFormInternal {
  return {
    ...values,
    materials: values.materials.map((value) => ({ value })),
    features: values.features.map((value) => ({ value })),
    careInstructions: values.careInstructions.map((value) => ({ value })),
    shippingInfo: values.shippingInfo.map((value) => ({ value })),
    returnPolicy: values.returnPolicy.map((value) => ({ value })),
  };
}

export function fromInternal(values: ProductFormInternal): ProductFormValues {
  return {
    ...values,
    materials: values.materials.map((f) => f.value).filter(Boolean),
    features: values.features.map((f) => f.value).filter(Boolean),
    careInstructions: values.careInstructions.map((f) => f.value).filter(Boolean),
    shippingInfo: values.shippingInfo.map((f) => f.value).filter(Boolean),
    returnPolicy: values.returnPolicy.map((f) => f.value).filter(Boolean),
  };
}

export const emptyProductFormValues: ProductFormValues = {
  slug: "",
  categoryId: "",
  name: "",
  tagline: "",
  description: "",
  story: "",
  price: 0,
  compareAtPrice: null,
  material: "",
  materials: [],
  dimensions: "",
  weight: "",
  colorway: "",
  finishTime: "",
  icon: "Sparkles",
  badges: [],
  features: [],
  careInstructions: [],
  shippingInfo: [],
  returnPolicy: [],
  faqs: [],
  stock: "in-stock",
  isPersonalized: false,
  images: [],
  variants: [],
  relatedProductIds: [],
};
