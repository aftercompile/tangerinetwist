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
  title: "Home Accents — Sculptural 3D Printed Décor",
  description:
    "Sculptural home accents 3D printed in premium PLA and hand-finished in India — vases, wall pieces and more considered objects for the home.",
  path: "/home-accents",
  keywords: ["3D Printed Home Decor", "Sculptural Vase", "Wall Clock", "Modern Home Décor", "Luxury Home Accessories"],
});

export default async function HomeAccentsPage() {
  const [category, products] = await Promise.all([
    getCategory("home-accents"),
    getProductsByCategory("home-accents"),
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
