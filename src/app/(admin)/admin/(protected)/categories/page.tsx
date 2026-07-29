import { getAdminCategoryRows } from "@/lib/db/admin-queries";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoryRows();
  return <CategoriesManager categories={categories} />;
}
