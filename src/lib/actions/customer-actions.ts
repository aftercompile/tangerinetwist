"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerAddresses, customers } from "@/lib/db/schema";
import { requireCustomerSession } from "@/lib/auth/customer-guard";
import { addressSchema, profileSchema, type AddressInput, type ProfileInput } from "@/lib/validation/auth";

export async function saveAddressAction(input: AddressInput): Promise<{ error?: string }> {
  const customer = await requireCustomerSession();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, isDefault, ...rest } = parsed.data;

  await db.transaction(async (tx) => {
    if (isDefault) {
      await tx
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customer.id));
    }
    if (id) {
      await tx
        .update(customerAddresses)
        .set({ ...rest, isDefault })
        .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)));
    } else {
      await tx.insert(customerAddresses).values({ ...rest, isDefault, customerId: customer.id });
    }
  });

  revalidatePath("/account");
  return {};
}

export async function deleteAddressAction(id: string): Promise<{ error?: string }> {
  const customer = await requireCustomerSession();
  await db
    .delete(customerAddresses)
    .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)));
  revalidatePath("/account");
  return {};
}

export async function updateProfileAction(input: ProfileInput): Promise<{ error?: string }> {
  const customer = await requireCustomerSession();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(customers)
    .set({ fullName: parsed.data.fullName, phone: parsed.data.phone || null })
    .where(eq(customers.id, customer.id));

  revalidatePath("/account");
  return {};
}
