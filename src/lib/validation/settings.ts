import { z } from "zod";

export const gstSettingsSchema = z.object({
  gstState: z.string().trim().min(1, "Enter your GST-registered state"),
  gstRatePercent: z.coerce.number().min(0, "Rate can't be negative").max(100, "Rate can't exceed 100%"),
  defaultHsnCode: z.string().trim().min(1, "Enter an HSN code"),
});

export type GstSettingsInput = z.infer<typeof gstSettingsSchema>;
