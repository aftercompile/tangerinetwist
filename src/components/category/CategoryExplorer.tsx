"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

export function CategoryExplorer({ products }: { products: Product[] }) {
  const [loading, setLoading] = React.useState(true);
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [materials, setMaterials] = React.useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const availableMaterials = React.useMemo(
    () => Array.from(new Set(products.map((p) => p.material))),
    [products]
  );

  const filtered = React.useMemo(() => {
    let list = products;
    if (materials.length > 0) {
      list = list.filter((p) => materials.includes(p.material));
    }
    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => Number(b.badges.includes("bestseller")) - Number(a.badges.includes("bestseller")));
    }
    return list;
  }, [products, materials, sort]);

  function toggleMaterial(material: string) {
    setMaterials((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    );
  }

  return (
    <div className="container-wide py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <aside className="hidden w-56 shrink-0 sm:block">
          <FilterPanel
            availableMaterials={availableMaterials}
            materials={materials}
            toggleMaterial={toggleMaterial}
          />
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </Button>
              <p className="text-sm text-muted">{filtered.length} products</p>
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtersOpen && (
            <div className="mb-8 rounded-2xl border border-border p-5 sm:hidden">
              <FilterPanel
                availableMaterials={availableMaterials}
                materials={materials}
                toggleMaterial={toggleMaterial}
              />
            </div>
          )}

          {materials.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {materials.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMaterial(m)}
                  className="flex items-center gap-1.5 rounded-full bg-beige px-3 py-1.5 text-xs text-charcoal"
                >
                  {m} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {!loading && filtered.length === 0 && (
            <p className="py-20 text-center text-sm text-muted">
              No products match these filters. Try clearing a few.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  availableMaterials,
  materials,
  toggleMaterial,
}: {
  availableMaterials: string[];
  materials: string[];
  toggleMaterial: (m: string) => void;
}) {
  return (
    <div>
      <Label className="mb-3">Material</Label>
      <div className="flex flex-col gap-3">
        {availableMaterials.map((material) => (
          <label key={material} className="flex cursor-pointer items-center gap-2.5 text-sm text-charcoal">
            <Checkbox
              checked={materials.includes(material)}
              onCheckedChange={() => toggleMaterial(material)}
            />
            {material}
          </label>
        ))}
      </div>
    </div>
  );
}
