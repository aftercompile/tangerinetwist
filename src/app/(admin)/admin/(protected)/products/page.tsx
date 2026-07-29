import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProductRows } from "@/lib/db/admin-queries";
import { getAllCategories } from "@/lib/db/queries";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProductRows(), getAllCategories()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{products.length} products</p>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> New Product
          </Link>
        </Button>
      </div>
      <ProductsTable products={products} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
    </div>
  );
}
