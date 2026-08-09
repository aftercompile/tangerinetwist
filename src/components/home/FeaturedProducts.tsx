import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { Price } from "@/components/shared/Price";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Four curated pieces, not a catalogue. The tabbed best-sellers/new/favorites
 * browser this replaces belongs on a listing page — the homepage just shows a
 * few things we're proud of and points at /products for the rest.
 *
 * Cards are deliberately quiet: photograph, name, price. Ratings, badges,
 * add-to-cart and the dark scrim overlay all live on the full ProductCard used
 * in catalogue contexts; here the photography does the selling.
 */
export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const [first, second, ...smalls] = products;

  return (
    <section className="container-wide pt-16 lg:pt-20">
      <AnimatedReveal className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="h-display text-3xl leading-[1.1] md:text-4xl lg:text-[2.75rem]">
            Selected pieces.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            A few of our favourites, made in small batches.
          </p>
        </div>
        <Link
          href="/products"
          className="link-underline hidden items-center gap-1.5 text-base font-medium text-charcoal sm:inline-flex"
        >
          View all products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </AnimatedReveal>

      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:mt-14 lg:grid-cols-12 lg:gap-x-5">
        <AnimatedReveal className="col-span-2 lg:col-span-6 lg:row-span-2">
          <FeaturedCard
            product={first}
            className="h-full"
            imageClassName="aspect-[4/5] lg:aspect-auto lg:min-h-0 lg:flex-1"
            imgSizes="(max-width: 1024px) 100vw, 60vw"
          />
        </AnimatedReveal>

        {second && (
          <AnimatedReveal delay={staggerDelay(1, 0.08)} className="col-span-2 lg:col-span-6">
            <FeaturedCard
              product={second}
              imageClassName="aspect-[4/3] lg:aspect-[16/10]"
              imgSizes="(max-width: 1024px) 100vw, 50vw"
            />
          </AnimatedReveal>
        )}

        {smalls.map((product, i) => (
          <AnimatedReveal
            key={product.id}
            delay={staggerDelay(i + 2, 0.08)}
            className="col-span-1 lg:col-span-3"
          >
            <FeaturedCard
              product={product}
              imageClassName="aspect-[4/5] lg:aspect-square"
              imgSizes="(max-width: 1024px) 50vw, 25vw"
            />
          </AnimatedReveal>
        ))}
      </div>

      <div className="mt-10 sm:hidden">
        <Link
          href="/products"
          className="link-underline inline-flex items-center gap-1.5 text-base font-medium text-charcoal"
        >
          View all products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function FeaturedCard({
  product,
  className,
  imageClassName,
  imgSizes,
}: {
  product: Product;
  className?: string;
  imageClassName?: string;
  imgSizes: string;
}) {
  return (
    <Link href={`/product/${product.slug}`} className={cn("group flex flex-col", className)}>
      <div className={cn("relative overflow-hidden rounded-xl bg-beige/50", imageClassName)}>
        <ProductImagePlaceholder
          icon={product.icon}
          tone={product.images[0]?.tone ?? "beige"}
          src={product.images[0]?.src}
          alt={product.images[0]?.alt || product.name}
          sizes={imgSizes}
          className="absolute inset-0 h-full w-full transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3">
        <h3 className="font-display text-base leading-snug text-charcoal sm:text-lg">
          {product.name}
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" className="mt-1" />
      </div>
    </Link>
  );
}
