"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/guard";
import { db } from "@/lib/db/index";
import { storeSettings } from "@/lib/db/schema";
import { gstSettingsSchema, type GstSettingsInput } from "@/lib/validation/settings";

export async function updateGstSettings(input: GstSettingsInput): Promise<{ error?: string }> {
  await requireAdminSession();

  const parsed = gstSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid GST settings" };
  }
  const { gstState, gstRatePercent, defaultHsnCode } = parsed.data;

  await db
    .insert(storeSettings)
    .values({ id: 1, gstState, gstRatePercent: String(gstRatePercent), defaultHsnCode, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: storeSettings.id,
      set: { gstState, gstRatePercent: String(gstRatePercent), defaultHsnCode, updatedAt: new Date() },
    });

  revalidatePath("/admin/tax");
  return {};
}
