import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";
import { getCategory } from "@/data/categories";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs";
import { Reviews } from "@/components/product/Reviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RecentlyViewedSection } from "@/components/product/RecentlyViewedSection";
import { RecordRecentlyViewed } from "@/components/product/RecordRecentlyViewed";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { buildMetadata, siteConfig } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return buildMetadata({
    title: `${product.name} — ${product.tagline}`,
    description: product.description,
    path: `/product/${product.slug}`,
  });
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const category = getCategory(product.category)!;
  const related = getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    image: `${siteConfig.url}/product/${product.slug}`,
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <div className="container-wide py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecordRecentlyViewed slug={product.slug} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: category.name, href: `/${category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
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
