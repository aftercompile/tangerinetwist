import { Metadata } from "next";
import { getCategory, getProductsByCategory } from "@/lib/db/queries";
import { CategoryBanner } from "@/components/category/CategoryBanner";
import { CategoryExplorer } from "@/components/category/CategoryExplorer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Designer Lamps — Premium 3D Printed Lighting",
  description:
    "Sculptural designer lamps 3D printed in premium PLA and hand-finished in India. Warm, diffused light for modern homes. ₹1,299–₹1,799.",
  path: "/lamps",
  keywords: ["3D Printed Lamps", "Designer Lamps", "PLA Home Décor", "Modern Home Décor", "Luxury Home Accessories"],
});

export default async function LampsPage() {
  const [category, products] = await Promise.all([
    getCategory("lamps"),
    getProductsByCategory("lamps"),
  ]);
  return (
    <>
      <CategoryBanner category={category!} />
      <CategoryExplorer products={products} />
    </>
  );
}
