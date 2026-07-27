import { Metadata } from "next";
import { getCategory } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { CategoryBanner } from "@/components/category/CategoryBanner";
import { CategoryExplorer } from "@/components/category/CategoryExplorer";
import { buildMetadata } from "@/lib/seo";

const category = getCategory("desk-organizers")!;

export const metadata: Metadata = buildMetadata({
  title: "Desk Organizers — Modern Workspace Accessories",
  description:
    "Modular desk organizers, stands and cable management for modern work-from-home and creator setups. Precision 3D printed. ₹399–₹999.",
  path: "/desk-organizers",
  keywords: ["Desk Organizers", "Workspace Accessories", "Contemporary Desk Setup", "Minimal Desk Accessories"],
});

export default function DeskOrganizersPage() {
  const products = getProductsByCategory("desk-organizers");
  return (
    <>
      <CategoryBanner category={category} />
      <CategoryExplorer products={products} />
    </>
  );
}
