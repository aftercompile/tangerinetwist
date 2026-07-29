"use client";

import * as React from "react";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { Product } from "@/lib/types";
import { RelatedProducts } from "./RelatedProducts";

export function RecentlyViewedSection({ exclude }: { exclude: string }) {
  const { slugs } = useRecentlyViewed();
  const [products, setProducts] = React.useState<Product[]>([]);

  const filteredSlugs = React.useMemo(
    () => slugs.filter((s) => s !== exclude).slice(0, 4),
    [slugs, exclude]
  );

  React.useEffect(() => {
    if (filteredSlugs.length === 0) {
      setProducts([]);
      return;
    }
    fetch("/api/products/by-slugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: filteredSlugs }),
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
  }, [filteredSlugs]);

  return <RelatedProducts products={products} title="Recently Viewed" />;
}
