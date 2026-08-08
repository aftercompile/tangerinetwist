"use client";

import * as React from "react";
import { Product, ProductVariant } from "@/lib/types";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

// ProductGallery and ProductInfo are siblings in the page's two-column grid (see
// product/[slug]/page.tsx) but need to share which variant is selected — this wraps both
// so the selection lives in one place: the gallery swaps to that variant's dedicated
// photos, and ProductInfo reflects its price/stock and is what the customer actually adds
// to cart. Renders a Fragment (no wrapping element) so the parent grid's `lg:grid-cols-2`
// still applies directly to these two children, unchanged from before this component existed.
export function ProductDetail({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | undefined>(
    product.variants?.[0]
  );

  const galleryImages =
    selectedVariant && selectedVariant.images.length > 0 ? selectedVariant.images : product.images;

  return (
    <>
      {/* Keyed by variant so switching resets the gallery's internal state (active photo,
          zoom, measured aspect ratios) instead of carrying over an index that may no
          longer make sense for the new photo set. */}
      <ProductGallery key={selectedVariant?.id ?? "base"} images={galleryImages} name={product.name} />
      <ProductInfo product={product} selectedVariant={selectedVariant} onSelectVariant={setSelectedVariant} />
    </>
  );
}
