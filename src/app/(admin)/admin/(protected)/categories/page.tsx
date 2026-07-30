import { getAdminCategoryRows } from "@/lib/db/admin-queries";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

// Nothing in this page calls a dynamic API, so Next's automatic static optimization
// would otherwise freeze it at build time — admin data pages must always be live.
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoryRows();
  return <CategoriesManager categories={categories} />;
}
