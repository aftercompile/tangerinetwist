"use client";

import * as React from "react";
import { toast } from "sonner";
import { Product, ProductVariant } from "@/lib/types";

export interface CartLine {
  slug: string;
  name: string;
  price: number;
  image: { icon: string; tone: string; src?: string };
  material: string;
  quantity: number;
  // Absent for a product with no variants. Two different variants of the same product are
  // deliberately separate lines (see lineKey) rather than merging quantities together.
  variantId?: string;
  variantLabel?: string;
}

// Two variants of the same product must never collapse into one line the way two calls for
// the same plain product do — this is the identity a line is matched/deduped by everywhere
// below, not slug alone.
function lineKey(slug: string, variantId?: string): string {
  return `${slug}::${variantId ?? ""}`;
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (slug: string, variantId?: string) => void;
  updateQuantity: (slug: string, quantity: number, variantId?: string) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tt-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [isOpen, setOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = React.useCallback((product: Product, quantity = 1, variant?: ProductVariant) => {
    setLines((prev) => {
      const key = lineKey(product.slug, variant?.id);
      const existing = prev.find((l) => lineKey(l.slug, l.variantId) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.slug, l.variantId) === key ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      const variantImage = variant?.images[0];
      const fallbackImage = product.images[0];
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          price: variant?.price ?? product.price,
          image: {
            icon: product.icon,
            tone: (variantImage ?? fallbackImage)?.tone ?? "beige",
            src: (variantImage ?? fallbackImage)?.src,
          },
          material: product.material,
          quantity,
          variantId: variant?.id,
          variantLabel: variant ? [variant.size, variant.color].filter(Boolean).join(" / ") : undefined,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
    setOpen(true);
  }, []);

  const removeItem = React.useCallback((slug: string, variantId?: string) => {
    const key = lineKey(slug, variantId);
    setLines((prev) => prev.filter((l) => lineKey(l.slug, l.variantId) !== key));
  }, []);

  const updateQuantity = React.useCallback((slug: string, quantity: number, variantId?: string) => {
    const key = lineKey(slug, variantId);
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l.slug, l.variantId) !== key)
        : prev.map((l) => (lineKey(l.slug, l.variantId) === key ? { ...l, quantity } : l))
    );
  }, []);

  const clear = React.useCallback(() => setLines([]), []);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, isOpen, setOpen, addItem, removeItem, updateQuantity, clear, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
