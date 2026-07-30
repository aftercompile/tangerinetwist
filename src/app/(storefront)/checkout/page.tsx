import { getCurrentCustomer } from "@/lib/auth/customer-guard";
import { getCustomerAddresses } from "@/lib/db/customer-queries";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

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
        pin: defaultAddress.pin,
      }
    : { fullName: customer.fullName, email: customer.email };

  return <CheckoutForm initialShipping={initialShipping} />;
}
