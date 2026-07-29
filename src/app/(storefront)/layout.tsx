import { Providers } from "@/context/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { getAllCategories } from "@/lib/db/queries";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await getAllCategories();

  return (
    <Providers>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <Navbar categories={categories} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </Providers>
  );
}
