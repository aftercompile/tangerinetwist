"use client";

import * as React from "react";
import { toast } from "sonner";
import { Product } from "@/lib/types";

export interface CartLine {
  slug: string;
  name: string;
  price: number;
  image: { icon: string; tone: string };
  material: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
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

  const addItem = React.useCallback((product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === product.slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === product.slug ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: { icon: product.icon, tone: product.images[0]?.tone ?? "beige" },
          material: product.material,
          quantity,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
    setOpen(true);
  }, []);

  const removeItem = React.useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const updateQuantity = React.useCallback((slug: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, quantity } : l))
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
