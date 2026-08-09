import { Providers } from "@/context/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { getAllCategories } from "@/lib/db/queries";
import { getCurrentCustomer } from "@/lib/auth/customer-guard";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [categories, customer] = await Promise.all([getAllCategories(), getCurrentCustomer()]);
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <Providers>
      {/* Storefront-only — deliberately not in the root layout, so internal
          admin-panel usage on admin.tangerinetwist.in never mixes into
          customer analytics. Unset in local dev unless you opt in. */}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <Navbar categories={categories} customer={customer} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      <CartDrawer />
    </Providers>
  );
}
