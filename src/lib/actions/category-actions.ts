"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db/index";
import { categories } from "@/lib/db/schema";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validation/category";

function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("cause" in err)) return false;
  const cause = (err as { cause?: unknown }).cause;
  return typeof cause === "object" && cause !== null && "code" in cause && (cause as { code: string }).code === "23505";
}

function isForeignKeyViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("cause" in err)) return false;
  const cause = (err as { cause?: unknown }).cause;
  return typeof cause === "object" && cause !== null && "code" in cause && (cause as { code: string }).code === "23503";
}

function revalidateStorefront() {
  revalidateTag("categories");
  revalidateTag("products");
  revalidatePath("/");
  // Admin list/detail views read live (uncached) data server-side, but the client's
  // Router Cache can still serve an already-visited page — bust it explicitly too.
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
}

export async function createCategory(values: CategoryFormValues): Promise<{ error?: string; id?: string }> {
  await requireAdminSession();
  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category data" };
  }

  try {
    const [row] = await db.insert(categories).values(parsed.data).returning({ id: categories.id });
    revalidateStorefront();
    return { id: row.id };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "A category with this slug already exists." };
    }
    throw err;
  }
}

export async function updateCategory(values: CategoryFormValues): Promise<{ error?: string; id?: string }> {
  await requireAdminSession();
  if (!values.id) return { error: "Missing category id" };

  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category data" };
  }

  try {
    await db
      .update(categories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(categories.id, values.id));
    revalidateStorefront();
    return { id: values.id };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "A category with this slug already exists." };
    }
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  await requireAdminSession();
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidateStorefront();
    return {};
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return { error: "This category still has products assigned to it. Move or delete them first." };
    }
    throw err;
  }
}
