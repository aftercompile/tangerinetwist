import { eq } from "drizzle-orm";
import { db } from "./index";
import { storeSettings } from "./schema";

export interface StoreSettings {
  gstState: string | null;
  gstRatePercent: number | null;
  defaultHsnCode: string | null;
}

// Reads the singleton row (id: 1), seeded by the 0011 migration. Uncached like every
// other admin-only query in admin-queries.ts — this feeds tax documents, which must
// always reflect whatever the admin last saved, not a stale build-time value.
export async function getStoreSettings(): Promise<StoreSettings> {
  const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, 1));
  return {
    gstState: row?.gstState ?? null,
    gstRatePercent: row?.gstRatePercent !== undefined && row?.gstRatePercent !== null ? Number(row.gstRatePercent) : null,
    defaultHsnCode: row?.defaultHsnCode ?? null,
  };
}

export function isGstConfigured(settings: StoreSettings): settings is {
  gstState: string;
  gstRatePercent: number;
  defaultHsnCode: string;
} {
  return settings.gstState !== null && settings.gstRatePercent !== null && settings.defaultHsnCode !== null;
}
