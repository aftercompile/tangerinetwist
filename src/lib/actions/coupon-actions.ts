"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db/index";
import { coupons, couponRedemptions } from "@/lib/db/schema";
import { calculateDiscount } from "@/lib/coupons";
import { couponFormSchema, type CouponFormValues } from "@/lib/validation/coupon";

function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("cause" in err)) return false;
  const cause = (err as { cause?: unknown }).cause;
  return typeof cause === "object" && cause !== null && "code" in cause && (cause as { code: string }).code === "23505";
}

type Coupon = typeof coupons.$inferSelect;

// Shared by the read-only checkout preview (validateCoupon) and the authoritative
// re-check inside placeOrder/createOrderForPayment — so "what counts as valid" can never
// drift between the two. Checked in order, first failure wins.
export async function getValidCoupon(
  code: string,
  subtotal: number,
  email: string
): Promise<{ coupon: Coupon; discountAmount: number } | { error: string }> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return { error: "Enter a coupon code" };

  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, normalizedCode));
  if (!coupon || !coupon.active) return { error: "This coupon code isn't valid" };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return { error: "This coupon has expired" };
  if (subtotal < coupon.minOrderValue) {
    return { error: `Add ${coupon.minOrderValue - subtotal > 0 ? "more" : ""} items — this code needs a minimum order of ₹${coupon.minOrderValue}` };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { error: "This coupon has reached its usage limit" };
  }

  if (coupon.oncePerCustomer) {
    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await db
      .select({ id: couponRedemptions.id })
      .from(couponRedemptions)
      .where(and(eq(couponRedemptions.couponId, coupon.id), eq(couponRedemptions.customerEmail, normalizedEmail)));
    if (existing) return { error: "You've already used this coupon" };
  }

  const discountAmount = calculateDiscount(subtotal, coupon.discountType, coupon.discountValue);
  return { coupon, discountAmount };
}

// Read-only preview for the checkout "Apply" button — never mutates usedCount or inserts
// a redemption. The real, authoritative check + consume happens inside
// placeOrder/createOrderForPayment (order-actions.ts) at the moment the order is placed.
export async function validateCoupon(
  code: string,
  subtotal: number,
  email: string
): Promise<{ discountAmount?: number; error?: string }> {
  const result = await getValidCoupon(code, subtotal, email);
  if ("error" in result) return { error: result.error };
  return { discountAmount: result.discountAmount };
}

function revalidateCoupons() {
  revalidatePath("/admin/coupons");
}

export async function createCoupon(values: CouponFormValues): Promise<{ error?: string; id?: string }> {
  await requireAdminSession();
  const parsed = couponFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid coupon data" };
  }
  const { code, discountType, discountValue, minOrderValue, maxUses, oncePerCustomer, expiresAt, active } = parsed.data;

  try {
    const [row] = await db
      .insert(coupons)
      .values({
        code,
        discountType,
        discountValue,
        minOrderValue,
        maxUses: maxUses ?? null,
        oncePerCustomer,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active,
      })
      .returning({ id: coupons.id });
    revalidateCoupons();
    return { id: row.id };
  } catch (err) {
    if (isUniqueViolation(err)) return { error: "A coupon with this code already exists." };
    throw err;
  }
}

export async function updateCoupon(values: CouponFormValues): Promise<{ error?: string; id?: string }> {
  await requireAdminSession();
  if (!values.id) return { error: "Missing coupon id" };

  const parsed = couponFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid coupon data" };
  }
  const { code, discountType, discountValue, minOrderValue, maxUses, oncePerCustomer, expiresAt, active } = parsed.data;

  try {
    await db
      .update(coupons)
      .set({
        code,
        discountType,
        discountValue,
        minOrderValue,
        maxUses: maxUses ?? null,
        oncePerCustomer,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, values.id));
    revalidateCoupons();
    return { id: values.id };
  } catch (err) {
    if (isUniqueViolation(err)) return { error: "A coupon with this code already exists." };
    throw err;
  }
}

export async function deleteCoupon(id: string): Promise<{ error?: string }> {
  await requireAdminSession();
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidateCoupons();
  return {};
}
