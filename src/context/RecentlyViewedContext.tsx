"use client";

import * as React from "react";

interface RecentlyViewedContextValue {
  slugs: string[];
  record: (slug: string) => void;
}

const RecentlyViewedContext = React.createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = "tt-recently-viewed";
const MAX_ITEMS = 8;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
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

  const record = React.useCallback((slug: string) => {
    setSlugs((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_ITEMS));
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ slugs, record }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = React.useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}
