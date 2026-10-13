"use client";

import type { BuilderConfig, Design } from "@/lib/letter-builder/types";
import { designKey, designLabel, priceDesign } from "@/lib/letter-builder/design";
import { isLineSoldOut } from "@/lib/stock";
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
  // Letter-builder lines (src/lib/letter-builder): the customer's design, a fingerprint of it
  // (what makes two designs of the same product separate lines), and the product's builder
  // config as it was — needed to draw the thumbnail. The price here is only the browser's
  // estimate; checkout re-prices the design on the server.
  design?: Design;
  designKey?: string;
  builderConfig?: BuilderConfig;
}

// Two variants of the same product must never collapse into one line the way two calls for
// the same plain product do — this is the identity a line is matched/deduped by everywhere
// below, not slug alone.
function lineKey(slug: string, variantId?: string, designKey?: string): string {
  return `${slug}::${variantId ?? ""}::${designKey ?? ""}`;
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant, design?: Design) => void;
  removeItem: (slug: string, variantId?: string, designKey?: string) => void;
  updateQuantity: (slug: string, quantity: number, variantId?: string, designKey?: string) => void;
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

  const addItem = React.useCallback((product: Product, quantity = 1, variant?: ProductVariant, design?: Design) => {
    // The buttons are already hidden/disabled for sold-out pieces; this just guarantees no
    // other call path can put one in the cart. Checkout re-checks on the server regardless.
    if (isLineSoldOut(product, variant)) return;
    // A design only means something on a letter-builder product.
    const config = product.builderConfig;
    const custom = design && config ? design : undefined;
    const dKey = custom ? designKey(custom) : undefined;
    setLines((prev) => {
      const key = lineKey(product.slug, variant?.id, dKey);
      const existing = prev.find((l) => lineKey(l.slug, l.variantId, l.designKey) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.slug, l.variantId, l.designKey) === key ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      const variantImage = variant?.images[0];
      const fallbackImage = product.images[0];
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          price: custom && config ? priceDesign(config, custom) : variant?.price ?? product.price,
          image: {
            icon: product.icon,
            tone: (variantImage ?? fallbackImage)?.tone ?? "beige",
            src: (variantImage ?? fallbackImage)?.src,
          },
          material: product.material,
          quantity,
          variantId: variant?.id,
          variantLabel:
            custom && config
              ? designLabel(config, custom)
              : variant
                ? [variant.size, variant.color].filter(Boolean).join(" / ")
                : undefined,
          ...(custom && config ? { design: custom, designKey: dKey, builderConfig: config } : {}),
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
    setOpen(true);
  }, []);

  const removeItem = React.useCallback((slug: string, variantId?: string, dKey?: string) => {
    const key = lineKey(slug, variantId, dKey);
    setLines((prev) => prev.filter((l) => lineKey(l.slug, l.variantId, l.designKey) !== key));
  }, []);

  const updateQuantity = React.useCallback((slug: string, quantity: number, variantId?: string, dKey?: string) => {
    const key = lineKey(slug, variantId, dKey);
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l.slug, l.variantId, l.designKey) !== key)
        : prev.map((l) => (lineKey(l.slug, l.variantId, l.designKey) === key ? { ...l, quantity } : l))
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
