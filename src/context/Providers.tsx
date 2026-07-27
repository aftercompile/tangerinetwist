"use client";

import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { RecentlyViewedProvider } from "./RecentlyViewedContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
