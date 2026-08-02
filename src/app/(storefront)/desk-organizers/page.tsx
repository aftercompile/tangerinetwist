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
  title: "Desk Organizers — Modern Workspace Accessories",
  description:
    "Modular desk organizers, stands and cable management for modern work-from-home and creator setups. Precision 3D printed. ₹399–₹999.",
  path: "/desk-organizers",
  keywords: ["Desk Organizers", "Workspace Accessories", "Contemporary Desk Setup", "Minimal Desk Accessories"],
});

export default async function DeskOrganizersPage() {
  const [category, products] = await Promise.all([
    getCategory("desk-organizers"),
    getProductsByCategory("desk-organizers"),
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
