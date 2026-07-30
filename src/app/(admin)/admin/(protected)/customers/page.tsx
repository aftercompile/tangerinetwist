import { getAdminCustomerRows } from "@/lib/db/admin-queries";
import { CustomersTable } from "@/components/admin/CustomersTable";

// Nothing here calls a dynamic API, so Next's automatic static optimization would
// otherwise freeze it at build time — admin data pages must always be live.
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomerRows();

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">{customers.length} registered customers</p>
      <CustomersTable customers={customers} />
    </div>
  );
}
