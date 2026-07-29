import { Metadata } from "next";
import { getCategory, getProductsByCategory } from "@/lib/db/queries";
import { CategoryBanner } from "@/components/category/CategoryBanner";
import { CategoryExplorer } from "@/components/category/CategoryExplorer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Decorative Idols — 8K Resin Printed, Hand-Finished",
  description:
    "Ultra-high-detail 8K resin printed decorative idols, hand-finished for a premium, lightweight, durable finish. ₹1,199–₹1,799.",
  path: "/idols",
  keywords: ["Decorative Idols", "Resin Idols", "8K Resin Printing", "Luxury Home Accessories", "Modern Home Décor"],
});

export default async function IdolsPage() {
  const [category, products] = await Promise.all([
    getCategory("idols"),
    getProductsByCategory("idols"),
  ]);
  return (
    <>
      <CategoryBanner category={category!} />
      <CategoryExplorer products={products} />
    </>
  );
}
