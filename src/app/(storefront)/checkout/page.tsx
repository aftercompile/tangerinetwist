import { Metadata } from "next";
import { getCurrentCustomer } from "@/lib/auth/customer-guard";
import { getCustomerAddresses } from "@/lib/db/customer-queries";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Guest checkout is unaffected — a signed-out visitor gets no customer/addresses and
// CheckoutForm renders exactly as it always has, with no initialShipping prop at all.
export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return <CheckoutForm />;

  const addresses = await getCustomerAddresses(customer.id);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const initialShipping = defaultAddress
    ? {
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        email: customer.email,
        address: defaultAddress.addressLine,
        city: defaultAddress.city,
        state: defaultAddress.state ?? "",
        pin: defaultAddress.pin,
      }
    : { fullName: customer.fullName, email: customer.email };

  return <CheckoutForm initialShipping={initialShipping} />;
}
