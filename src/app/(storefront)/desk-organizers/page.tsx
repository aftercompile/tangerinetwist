import { Metadata } from "next";
import { getCategory, getProductsByCategory } from "@/lib/db/queries";
import { CategoryBanner } from "@/components/category/CategoryBanner";
import { CategoryExplorer } from "@/components/category/CategoryExplorer";
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
      <CategoryBanner category={category!} />
      <CategoryExplorer products={products} />
    </>
  );
}
