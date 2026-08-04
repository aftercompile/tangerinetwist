import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { staggerDelay } from "@/lib/motion";

export function RelatedProducts({ products, title = "You may also like" }: { products: Product[]; title?: string }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-24">
      <SectionHeading title={title} />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, i) => (
          <AnimatedReveal key={product.id} delay={staggerDelay(i, 0.08, 0.32)}>
            <ProductCard product={product} />
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}
