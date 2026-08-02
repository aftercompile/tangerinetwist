import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProductSlugs,
  getCategory,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/db/queries";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs";
import { Reviews } from "@/components/product/Reviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RecentlyViewedSection } from "@/components/product/RecentlyViewedSection";
import { RecordRecentlyViewed } from "@/components/product/RecordRecentlyViewed";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { buildMetadata, siteConfig } from "@/lib/seo";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return buildMetadata({
    title: `${product.name} — ${product.tagline}`,
    description: product.description,
    path: `/product/${product.slug}`,
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [category, related] = await Promise.all([
    getCategory(product.category),
    getRelatedProducts(product),
  ]);

  // Real image URLs, not the page URL — Google's Product rich result requires
  // `image` to resolve to actual image files to be eligible at all. Falls
  // back to nothing (field omitted) rather than a wrong URL if a product has
  // no real photo yet, since every non-photo image is a CSS/SVG placeholder
  // with no meaningful file to point to. Admin-uploaded images are already
  // absolute Supabase Storage URLs; only seed-fixture-style relative paths
  // (starting with "/") need siteConfig.url prepended.
  const imageUrls = product.images
    .map((img) => img.src)
    .filter((src): src is string => Boolean(src))
    .map((src) => (src.startsWith("/") ? `${siteConfig.url}${src}` : src));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: siteConfig.name },
    ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock === "in-stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
    // Google's guidelines explicitly disallow AggregateRating with zero
    // reviews (it reads as fabricated) — only emit it once real reviews exist.
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="container-wide py-10 pb-28 lg:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecordRecentlyViewed slug={product.slug} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: category?.name ?? product.category, href: `/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>

      <ProductTabs product={product} />
      <Reviews product={product} />
      <RelatedProducts products={related} />
      <RecentlyViewedSection exclude={product.slug} />
    </div>
  );
}
