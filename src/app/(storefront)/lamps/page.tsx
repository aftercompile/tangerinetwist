import { Metadata } from "next";
import { getCategory, getProductsByCategory } from "@/lib/db/queries";
import { CategoryHero } from "@/components/category/CategoryHero";
import { CategoryStats } from "@/components/category/CategoryStats";
import { CategoryStory } from "@/components/category/CategoryStory";
import { CategoryExplorer, GRID_ANCHOR_ID } from "@/components/category/CategoryExplorer";
import { CategoryMoodCollections } from "@/components/category/CategoryMoodCollections";
import { CategoryClosingCTA } from "@/components/category/CategoryClosingCTA";
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
      <CategoryHero category={category!} />
      <CategoryStats productCount={products.length} countLabel={category!.shortName} stats={category!.stats} />
      <CategoryStory category={category!} />
      <CategoryExplorer products={products} category={category!} />
      <CategoryMoodCollections categorySlug={category!.slug} products={products} gridAnchorId={GRID_ANCHOR_ID} />
      <CategoryClosingCTA category={category!} gridAnchorId={GRID_ANCHOR_ID} />
    </>
  );
}
