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
      <CategoryHero category={category!} />
      <CategoryStats productCount={products.length} countLabel={category!.shortName} stats={category!.stats} />
      <CategoryStory category={category!} />
      <CategoryExplorer products={products} category={category!} />
      <CategoryMoodCollections categorySlug={category!.slug} products={products} gridAnchorId={GRID_ANCHOR_ID} />
      <CategoryClosingCTA category={category!} gridAnchorId={GRID_ANCHOR_ID} />
    </>
  );
}
