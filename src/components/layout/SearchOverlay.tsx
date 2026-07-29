"use client";

import * as React from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { Price } from "@/components/shared/Price";
import { Input } from "@/components/ui/input";

export function SearchOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setResults(data.products ?? []))
        .catch((err) => {
          if (err.name !== "AbortError") setResults([]);
        });
    }, 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl bg-warm-white shadow-lift outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-4">
          <Dialog.Title className="sr-only">Search products</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Search className="h-4 w-4 text-muted" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lamps, idols, desk organizers..."
              className="h-auto border-none p-0 focus:border-none focus-visible:ring-0"
            />
            <Dialog.Close aria-label="Close search" className="text-muted hover:text-charcoal">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim() && results.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">No products found for &ldquo;{query}&rdquo;.</p>
            )}
            {results.map((product) => (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-beige"
              >
                <ProductImagePlaceholder
                  icon={product.icon}
                  tone={product.images[0]?.tone ?? "beige"}
                  src={product.images[0]?.src}
                  alt={product.images[0]?.alt}
                  className="h-14 w-14 rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{product.name}</p>
                  <p className="text-xs text-muted">{product.tagline}</p>
                </div>
                <Price price={product.price} size="sm" />
              </Link>
            ))}
            {!query.trim() && (
              <div className="px-4 py-8 text-center text-sm text-muted">
                Try &ldquo;lamp&rdquo;, &ldquo;ganesha&rdquo;, or &ldquo;desk&rdquo;
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
