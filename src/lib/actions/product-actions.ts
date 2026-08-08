"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db/index";
import { productImages, productRelations, productVariants, products } from "@/lib/db/schema";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";

function isUniqueViolation(err: unknown): boolean {
  // postgres.js's raw PostgresError (with .code) is wrapped by Drizzle as `err.cause`, not on err itself.
  if (typeof err !== "object" || err === null || !("cause" in err)) return false;
  const cause = (err as { cause?: unknown }).cause;
  return typeof cause === "object" && cause !== null && "code" in cause && (cause as { code: string }).code === "23505";
}

function revalidateStorefront() {
  revalidateTag("products");
  revalidatePath("/");
  // /admin/products is force-dynamic (always reruns its query server-side), but the
  // client's Router Cache can still serve an already-visited list from before this
  // change — revalidatePath busts that too so the admin list updates immediately.
  revalidatePath("/admin/products");
}

export async function createProduct(
  values: ProductFormValues
): Promise<{ error?: string; id?: string }> {
  await requireAdminSession();

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }
  const data = parsed.data;

  try {
    const id = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(products)
        .values({
          slug: data.slug,
          categoryId: data.categoryId,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          story: data.story,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          material: data.material,
          materials: data.materials,
          dimensions: data.dimensions,
          weight: data.weight,
          colorway: data.colorway,
          finishTime: data.finishTime,
          icon: data.icon,
          badges: data.badges,
          features: data.features,
          careInstructions: data.careInstructions,
          shippingInfo: data.shippingInfo,
          returnPolicy: data.returnPolicy,
          faqs: data.faqs,
          stock: data.stock,
          isPersonalized: data.isPersonalized,
        })
        .returning({ id: products.id });

      await tx.insert(productImages).values(
        data.images.map((img, i) => ({
          productId: row.id,
          src: img.src,
          alt: img.alt,
          tone: img.tone,
          icon: img.icon,
          position: i,
        }))
      );

      // Variants first — their own generated id is the FK productImages.variantId needs,
      // so each variant's dedicated images can only be inserted once its row exists.
      if (data.variants.length > 0) {
        const insertedVariants = await tx
          .insert(productVariants)
          .values(
            data.variants.map((v, i) => ({
              productId: row.id,
              size: v.size || null,
              color: v.color || null,
              sku: v.sku || null,
              price: v.price ?? null,
              stock: v.stock,
              position: i,
            }))
          )
          .returning({ id: productVariants.id });

        const variantImageRows = data.variants.flatMap((v, i) =>
          v.images.map((img, j) => ({
            productId: row.id,
            variantId: insertedVariants[i].id,
            src: img.src,
            alt: img.alt,
            tone: img.tone,
            icon: img.icon,
            position: j,
          }))
        );
        if (variantImageRows.length > 0) {
          await tx.insert(productImages).values(variantImageRows);
        }
      }

      if (data.relatedProductIds.length > 0) {
        await tx.insert(productRelations).values(
          data.relatedProductIds.map((relatedProductId, i) => ({
            productId: row.id,
            relatedProductId,
            position: i,
          }))
        );
      }

      return row.id;
    });

    revalidateStorefront();
    return { id };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "A product with this slug already exists." };
    }
    throw err;
  }
}

export async function updateProduct(values: ProductFormValues): Promise<{ error?: string; id?: string }> {
  await requireAdminSession();
  if (!values.id) return { error: "Missing product id" };

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }
  const data = parsed.data;
  const id = values.id;

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          slug: data.slug,
          categoryId: data.categoryId,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          story: data.story,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          material: data.material,
          materials: data.materials,
          dimensions: data.dimensions,
          weight: data.weight,
          colorway: data.colorway,
          finishTime: data.finishTime,
          icon: data.icon,
          badges: data.badges,
          features: data.features,
          careInstructions: data.careInstructions,
          shippingInfo: data.shippingInfo,
          returnPolicy: data.returnPolicy,
          faqs: data.faqs,
          stock: data.stock,
          isPersonalized: data.isPersonalized,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));

      // Images deleted before variants — variant-scoped image rows reference
      // productVariants.id, so wiping them first means the variants delete right after
      // has nothing left to cascade through.
      await tx.delete(productImages).where(eq(productImages.productId, id));
      await tx.delete(productVariants).where(eq(productVariants.productId, id));

      await tx.insert(productImages).values(
        data.images.map((img, i) => ({
          productId: id,
          src: img.src,
          alt: img.alt,
          tone: img.tone,
          icon: img.icon,
          position: i,
        }))
      );

      if (data.variants.length > 0) {
        const insertedVariants = await tx
          .insert(productVariants)
          .values(
            data.variants.map((v, i) => ({
              productId: id,
              size: v.size || null,
              color: v.color || null,
              sku: v.sku || null,
              price: v.price ?? null,
              stock: v.stock,
              position: i,
            }))
          )
          .returning({ id: productVariants.id });

        const variantImageRows = data.variants.flatMap((v, i) =>
          v.images.map((img, j) => ({
            productId: id,
            variantId: insertedVariants[i].id,
            src: img.src,
            alt: img.alt,
            tone: img.tone,
            icon: img.icon,
            position: j,
          }))
        );
        if (variantImageRows.length > 0) {
          await tx.insert(productImages).values(variantImageRows);
        }
      }

      await tx.delete(productRelations).where(eq(productRelations.productId, id));
      if (data.relatedProductIds.length > 0) {
        await tx.insert(productRelations).values(
          data.relatedProductIds.map((relatedProductId, i) => ({
            productId: id,
            relatedProductId,
            position: i,
          }))
        );
      }
    });

    revalidateStorefront();
    return { id };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "A product with this slug already exists." };
    }
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdminSession();
  await db.delete(products).where(eq(products.id, id));
  revalidateStorefront();
  return {};
}
