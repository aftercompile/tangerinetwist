import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCurrentCustomer } from "@/lib/auth/customer-guard";
import { getCustomerOrderById } from "@/lib/db/customer-queries";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { OrderItemReviewAction } from "@/components/account/OrderItemReviewAction";
import { formatINR } from "@/lib/utils";

const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

const PAYMENT_LABEL = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  cod: "Cash on Delivery",
} as const;

// Account data must always be live — never statically frozen at build time.
export const dynamic = "force-dynamic";

export default async function AccountOrderPage({ params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login");

  const order = await getCustomerOrderById(customer.id, params.id);
  if (!order) notFound();

  return (
    <div className="container-wide py-16 lg:py-24">
      <Link href="/account" className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Account
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Order</p>
          <h1 className="h-display text-3xl md:text-4xl">{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-muted">
            Placed {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-beige px-3 py-1 text-xs font-medium text-charcoal">
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs text-muted">{PAYMENT_LABEL[order.paymentStatus]}</span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border p-7">
          <h2 className="text-base font-medium text-charcoal">Items</h2>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                <ProductImagePlaceholder
                  icon={item.imageIcon}
                  tone={item.imageTone}
                  src={item.imageSrc ?? undefined}
                  className="h-16 w-16 shrink-0 rounded-lg"
                />
                <div className="flex flex-1 justify-between">
                  <div>
                    <p className="font-medium text-charcoal">{item.name}</p>
                    <p className="text-xs text-muted">{item.material}</p>
                    <p className="text-xs text-muted">Qty {item.quantity}</p>
                    {order.status === "delivered" && item.productId && (
                      <div className="mt-2">
                        <OrderItemReviewAction
                          productId={item.productId}
                          orderId={order.id}
                          productName={item.name}
                          reviewed={item.reviewed}
                        />
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-charcoal">{formatINR(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="text-charcoal">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="text-charcoal">{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-charcoal">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border p-7">
            <h2 className="text-base font-medium text-charcoal">Shipping Address</h2>
            <p className="mt-2 text-sm text-charcoal">{order.addressLine}</p>
            <p className="text-sm text-charcoal">
              {order.city}
              {order.state ? `, ${order.state}` : ""} {order.pin}
            </p>
          </div>

          {order.courierName && (
            <div className="rounded-3xl border border-border p-7">
              <h2 className="text-base font-medium text-charcoal">Tracking</h2>
              <p className="mt-2 text-sm text-charcoal">{order.courierName}</p>
              {order.trackingEvents.length === 0 && (
                <p className="text-sm text-muted">{order.shiprocketStatus ?? "In transit"}</p>
              )}

              {order.trackingEvents.length > 0 && (
                <div className="mt-4 flex flex-col gap-0">
                  {order.trackingEvents.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            i === 0 ? "bg-tangerine-500" : "bg-beige"
                          }`}
                        />
                        {i < order.trackingEvents.length - 1 && (
                          <span className="w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="pb-3 text-sm">
                        <p className="font-medium text-charcoal">{event.status}</p>
                        {event.location && <p className="text-xs text-muted">{event.location}</p>}
                        <p className="text-xs text-muted">
                          {new Intl.DateTimeFormat("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(event.occurredAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-sm font-medium text-tangerine-600 hover:underline"
                >
                  Track shipment <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
