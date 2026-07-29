"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Product } from "@/lib/types";

export function FeaturedProducts({
  bestSellers,
  newArrivals,
  favorites,
}: {
  bestSellers: Product[];
  newArrivals: Product[];
  favorites: Product[];
}) {
  return (
    <section className="container-wide py-24">
      <SectionHeading
        eyebrow="Featured"
        title="Loved by design-conscious homes"
        description="A rotating edit of our best sellers, latest arrivals and highest-rated customer favorites."
        align="center"
      />

      <Tabs defaultValue="bestsellers" className="mt-14">
        <TabsList className="justify-center">
          <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
          <TabsTrigger value="new">New Arrivals</TabsTrigger>
          <TabsTrigger value="favorites">Customer Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="bestsellers">
          <ProductRow items={bestSellers} />
        </TabsContent>
        <TabsContent value="new">
          <ProductRow items={newArrivals} />
        </TabsContent>
        <TabsContent value="favorites">
          <ProductRow items={favorites} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ProductRow({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
