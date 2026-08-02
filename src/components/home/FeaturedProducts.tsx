"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Product } from "@/lib/types";
import { DURATION, EASE_PREMIUM, staggerDelay } from "@/lib/motion";

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
          <ProductRow items={bestSellers} tabKey="bestsellers" />
        </TabsContent>
        <TabsContent value="new">
          <ProductRow items={newArrivals} tabKey="new" />
        </TabsContent>
        <TabsContent value="favorites">
          <ProductRow items={favorites} tabKey="favorites" />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ProductRow({ items, tabKey }: { items: Product[]; tabKey: string }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {/* Keying on the tab makes switching a crossfade of the whole grid rather
          than an abrupt content swap. */}
      <motion.div
        key={tabKey}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATION.base, ease: EASE_PREMIUM }}
        className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
      >
        {items.map((product, i) => (
          <motion.div
            key={product.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: DURATION.slow,
              delay: reduced ? 0 : staggerDelay(i, 0.05),
              ease: EASE_PREMIUM,
            }}
          >
            <ProductCard product={product} siblings={items} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
