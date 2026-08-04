"use client";

import * as React from "react";
import { Product, CategoryMeta } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { FilterChips } from "./FilterChips";
import { SortSegmented, type SortOption } from "./SortSegmented";
import { CategoryLifestyleBreak } from "./CategoryLifestyleBreak";
import { computeFilterChips, productMatchesChip } from "@/lib/category-filters";

type SortKey = "featured" | "newest" | "popular" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: SortOption<SortKey>[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "rating", label: "Most Loved" },
];

// Scroll target for the lifestyle break's "Continue Exploring" CTA and the
// closing CTA's "Explore the Collection" button — both live outside this
// component, so the id is exported rather than duplicated as a string literal.
export const GRID_ANCHOR_ID = "shop";

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "popular":
      return list.sort((a, b) => b.reviewCount - a.reviewCount);
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return list.sort((a, b) => Number(b.badges.includes("bestseller")) - Number(a.badges.includes("bestseller")));
  }
}

export function CategoryExplorer({ products, category }: { products: Product[]; category: CategoryMeta }) {
  const [loading, setLoading] = React.useState(true);
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [active, setActive] = React.useState<string[]>([]);

  // A mood card elsewhere on the page can link back here with ?mood=<chipId>
  // (see CategoryMoodCollections, which uses a plain full-navigation <a> for
  // this rather than next/link — deliberately so this can be a mount-time
  // read of window.location instead of next/navigation's useSearchParams(),
  // which would force this entire product grid into a Suspense-gated
  // client-only render and lose server-rendered product content, a real SEO
  // cost on a category page).
  React.useEffect(() => {
    const mood = new URLSearchParams(window.location.search).get("mood");
    if (mood) setActive([mood]);
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const chips = React.useMemo(() => computeFilterChips(products), [products]);

  const filtered = React.useMemo(() => {
    if (active.length === 0) return products;
    return products.filter((p) => active.some((chipId) => productMatchesChip(p, chipId)));
  }, [products, active]);

  const sorted = React.useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  function toggleChip(id: string) {
    setActive((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  // Split into two batches with a lifestyle break between them, but only
  // when there's enough product to actually breathe around it.
  const showBreak = !loading && sorted.length >= 6 && Boolean(category.lifestyleImage || category.lifestyleHeadline);
  const splitAt = showBreak ? Math.ceil(sorted.length / 2) : sorted.length;
  const firstBatch = sorted.slice(0, splitAt);
  const secondBatch = sorted.slice(splitAt);

  return (
    <div id={GRID_ANCHOR_ID} className="scroll-mt-24 bg-cream py-20">
      <div className="container-wide">
        <div className="mb-10 flex flex-col gap-6">
          <FilterChips options={chips} active={active} onToggle={toggleChip} onClear={() => setActive([])} />
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {loading ? "Loading" : `${sorted.length} ${sorted.length === 1 ? "piece" : "pieces"}`}
            </p>
            <SortSegmented options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : firstBatch.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        {!loading && sorted.length === 0 && (
          <p className="py-24 text-center text-sm text-muted">
            No pieces match these filters. Try clearing a few.
          </p>
        )}
      </div>

      {showBreak && (
        <>
          <div className="mt-4">
            <CategoryLifestyleBreak
              image={category.lifestyleImage}
              headline={category.lifestyleHeadline}
              body={category.lifestyleBody}
              gridAnchorId={GRID_ANCHOR_ID}
            />
          </div>
          <div className="container-wide">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
              {secondBatch.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
