"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, ExternalLink } from "lucide-react";
import { getCustomerInvoiceUrl } from "@/lib/actions/customer-actions";

// Mirrors ShiprocketPanel.tsx's handlePrintInvoice: invoiceUrl is almost always already
// cached (generated automatically at ship time), so the common case is a plain link with
// no server round-trip. This only hits the server for the rare order where that failed.
export function OrderInvoiceLink({ orderId, invoiceUrl }: { orderId: string; invoiceUrl: string | null }) {
  const [loading, setLoading] = React.useState(false);

  if (invoiceUrl) {
    return (
      <a
        href={invoiceUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-sm font-medium text-tangerine-600 hover:underline"
      >
        <FileText className="h-3.5 w-3.5" /> Download invoice <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      const result = await getCustomerInvoiceUrl(orderId);
      if (result.error || !result.url) {
        toast.error(result.error ?? "Failed to fetch invoice");
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm font-medium text-tangerine-600 hover:underline disabled:opacity-50"
    >
      <FileText className="h-3.5 w-3.5" /> {loading ? "Fetching invoice…" : "Download invoice"}
    </button>
  );
}
