import { Metadata } from "next";
import { getAllProducts, getAllCategories } from "@/lib/db/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { buildMetadata } from "@/lib/seo";
import { staggerDelay } from "@/lib/motion";
import Link from "next/link";

export const metadata: Metadata = buildMetadata({
  title: "All Products",
  description:
    "Browse every TangerineTwist piece — designer lamps, decorative idols, desk organizers and home accents, 3D printed and hand-finished in India.",
  path: "/products",
});

export default async function AllProductsPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  return (
    <div className="container-wide py-10 md:py-16 lg:py-20">
      <AnimatedReveal className="max-w-2xl">
        <h1 className="h-display text-3xl leading-[1.08] md:text-4xl lg:text-5xl">All products</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted md:mt-4 md:text-base">
          Every piece we currently make, across all our collections.
        </p>
      </AnimatedReveal>

      {/* Category navigation strip */}
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none md:mt-8">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="shrink-0 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-charcoal transition hover:border-charcoal hover:bg-charcoal hover:text-cream md:text-sm"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between md:mt-10">
        <p className="text-xs text-muted md:text-sm">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
        {products.map((product, i) => (
          <AnimatedReveal key={product.id} delay={staggerDelay(i, 0.05)}>
            <ProductCard product={product} />
          </AnimatedReveal>
        ))}
      </div>
    </div>
  );
}
