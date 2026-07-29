"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Pencil, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { deleteProduct } from "@/lib/actions/product-actions";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { AdminProductRow } from "@/lib/db/admin-queries";

const PAGE_SIZE = 10;

export function ProductsTable({
  products,
  categories,
}: {
  products: AdminProductRow[];
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [stock, setStock] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      if (category !== "all" && p.categorySlug !== category) return false;
      if (stock !== "all" && p.stock !== stock) return false;
      return true;
    });
  }, [products, search, category, stock]);

  React.useEffect(() => setPage(1), [search, category, stock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const result = await deleteProduct(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Product deleted");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stock} onValueChange={setStock}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="made-to-order">Made to Order</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-warm-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Badges</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted">
                  No products match these filters.
                </TableCell>
              </TableRow>
            )}
            {pageItems.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProductImagePlaceholder
                      icon={p.thumbnailIcon}
                      tone={p.thumbnailTone}
                      src={p.thumbnailSrc ?? undefined}
                      className="h-11 w-11 shrink-0 rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-charcoal">{p.name}</p>
                      <p className="text-xs text-muted">{p.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.categoryName}</TableCell>
                <TableCell>{formatINR(p.price)}</TableCell>
                <TableCell className="capitalize">{p.stock.replace("-", " ")}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.badges.map((b) => (
                      <Badge key={b} variant={b as "bestseller" | "new" | "limited"}>
                        {b}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label={`Edit ${p.name}`}>
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${p.name}`}
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id, p.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
