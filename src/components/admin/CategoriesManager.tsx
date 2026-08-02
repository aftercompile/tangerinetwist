"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteCategory } from "@/lib/actions/category-actions";
import type { AdminCategoryRow } from "@/lib/db/admin-queries";
import type { CategoryFormValues } from "@/lib/validation/category";
import { CategoryForm } from "./CategoryForm";

export function CategoriesManager({ categories }: { categories: AdminCategoryRow[] }) {
  const router = useRouter();
  const [dialogState, setDialogState] = React.useState<
    { open: false } | { open: true; initialValues?: CategoryFormValues }
  >({ open: false });
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  function closeDialog() {
    setDialogState({ open: false });
  }

  function handleSaved() {
    closeDialog();
    router.refresh();
  }

  async function handleDelete(row: AdminCategoryRow) {
    if (row.productCount > 0) {
      toast.error(`Move or delete the ${row.productCount} product(s) in this category first.`);
      return;
    }
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    setDeletingId(row.id);
    try {
      const result = await deleteCategory(row.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Category deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogState({ open: true })}>
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-warm-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell>{c.material}</TableCell>
                <TableCell>{c.productCount}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${c.name}`}
                      onClick={() =>
                        setDialogState({
                          open: true,
                          initialValues: {
                            id: c.id,
                            slug: c.slug,
                            name: c.name,
                            shortName: c.shortName,
                            tagline: c.tagline,
                            description: c.description,
                            heroIcon: c.heroIcon,
                            material: c.material,
                          },
                        })
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${c.name}`}
                      disabled={deletingId === c.id}
                      onClick={() => handleDelete(c)}
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

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent title={dialogState.open && dialogState.initialValues ? "Edit Category" : "New Category"} className="max-w-lg p-7">
          <CategoryForm
            initialValues={dialogState.open ? dialogState.initialValues : undefined}
            onSaved={handleSaved}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
