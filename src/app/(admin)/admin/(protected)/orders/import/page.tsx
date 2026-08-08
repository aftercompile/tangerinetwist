import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImportOrdersClient } from "@/components/admin/orders/ImportOrdersClient";

export default function AdminImportOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
        </Link>
        <h2 className="mt-2 h-display text-2xl">Import Orders</h2>
        <p className="text-sm text-muted">Bring in orders from Amazon, Flipkart, or Meesho seller exports.</p>
      </div>
      <ImportOrdersClient />
    </div>
  );
}
