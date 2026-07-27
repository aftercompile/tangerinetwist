"use client";

import * as React from "react";
import { toast } from "sonner";

interface WishlistContextValue {
  slugs: string[];
  toggle: (slug: string, name: string) => void;
  has: (slug: string) => boolean;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "tt-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = React.useState<string[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs, hydrated]);

  const toggle = React.useCallback((slug: string, name: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) {
        toast(`Removed ${name} from wishlist`);
        return prev.filter((s) => s !== slug);
      }
      toast.success(`Added ${name} to wishlist`);
      return [...prev, slug];
    });
  }, []);

  const has = React.useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return (
    <WishlistContext.Provider value={{ slugs, toggle, has }}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
