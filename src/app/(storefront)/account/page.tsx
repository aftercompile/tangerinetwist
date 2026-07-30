import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth/customer-guard";
import { getCustomerAddresses, getCustomerOrders } from "@/lib/db/customer-queries";
import { AccountDashboard } from "@/components/account/AccountDashboard";

// Account data must always be live — never statically frozen at build time.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  // Middleware already guards this route; this is just belt-and-suspenders since the
  // page needs the customer row anyway to render.
  if (!customer) redirect("/account/login");

  const [orders, addresses] = await Promise.all([
    getCustomerOrders(customer.id),
    getCustomerAddresses(customer.id),
  ]);

  return <AccountDashboard customer={customer} orders={orders} addresses={addresses} />;
}
