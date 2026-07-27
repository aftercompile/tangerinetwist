"use client";

import * as React from "react";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { getProductBySlug } from "@/data/products";
import { RelatedProducts } from "./RelatedProducts";

export function RecentlyViewedSection({ exclude }: { exclude: string }) {
  const { slugs } = useRecentlyViewed();
  const products = slugs
    .filter((s) => s !== exclude)
    .map((s) => getProductBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  return <RelatedProducts products={products} title="Recently Viewed" />;
}
