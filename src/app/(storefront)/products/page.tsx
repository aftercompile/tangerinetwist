import { Metadata } from "next";
import { getAllProducts } from "@/lib/db/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { buildMetadata } from "@/lib/seo";
import { staggerDelay } from "@/lib/motion";

export const metadata: Metadata = buildMetadata({
  title: "All Products",
  description:
    "Browse every TangerineTwist piece — designer lamps, decorative idols, desk organizers and home accents, 3D printed and hand-finished in India.",
  path: "/products",
});

export default async function AllProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="container-wide py-16 lg:py-20">
      <AnimatedReveal className="max-w-2xl">
        <h1 className="h-display text-4xl leading-[1.08] md:text-5xl">All products</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Every piece we currently make, across all our collections.
        </p>
      </AnimatedReveal>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, i) => (
          <AnimatedReveal key={product.id} delay={staggerDelay(i, 0.05)}>
            <ProductCard product={product} />
          </AnimatedReveal>
        ))}
      </div>
    </div>
  );
}
