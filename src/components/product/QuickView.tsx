"use client";

import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { RatingStars } from "@/components/shared/RatingStars";
import { Price } from "@/components/shared/Price";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addItem } = useCart();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={`Quick view — ${product.name}`}>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <div className="aspect-square md:aspect-auto md:h-full">
            <ProductImagePlaceholder
              icon={product.icon}
              tone={product.images[0]?.tone ?? "beige"}
              src={product.images[0]?.src}
              alt={product.images[0]?.alt}
              className="h-full w-full rounded-l-2xl md:rounded-l-2xl md:rounded-tr-none"
            />
          </div>
          <div className="flex flex-col gap-4 p-8">
            <div className="flex gap-1.5">
              {product.badges.includes("bestseller") && <Badge variant="bestseller">Best Seller</Badge>}
              {product.badges.includes("new") && <Badge variant="new">New</Badge>}
            </div>
            <div>
              <h3 className="h-display text-2xl">{product.name}</h3>
              <p className="mt-1 text-sm text-muted">{product.tagline}</p>
            </div>
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
            <div className="text-xs text-muted">
              <span className="font-medium text-charcoal">Material — </span>
              {product.material}
            </div>
            <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
              <Button variant="accent" size="lg" className="flex-1" onClick={() => addItem(product, 1)}>
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`/product/${product.slug}`}>View Full Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
