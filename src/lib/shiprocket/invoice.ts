// Deliberately NOT a "use server" export — Next.js turns every export of a "use server"
// file into a directly POST-able action regardless of who calls it internally, and this
// helper takes no session of its own (by design, so it can serve both the admin and
// customer paths). Callers (getShiprocketInvoiceUrl, getCustomerInvoiceUrl) must verify
// the caller is allowed to see this order before calling it.
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { shiprocketFetch } from "@/lib/shiprocket/client";
import type { InvoiceResponse } from "@/lib/shiprocket/types";

export async function fetchAndPersistInvoiceUrl(
  orderId: string,
  shiprocketOrderId: string
): Promise<{ url?: string; error?: string }> {
  try {
    const invoice = await shiprocketFetch<InvoiceResponse>("/orders/print/invoice", {
      method: "POST",
      body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
    });
    await db.update(orders).set({ invoiceUrl: invoice.invoice_url }).where(eq(orders.id, orderId));
    return { url: invoice.invoice_url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate invoice" };
  }
}
