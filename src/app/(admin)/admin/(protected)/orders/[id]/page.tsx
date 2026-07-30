import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminOrderById } from "@/lib/db/admin-queries";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
          </Link>
          <h2 className="mt-2 h-display text-2xl">{order.orderNumber}</h2>
          <p className="text-sm text-muted">
            Placed {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg text-charcoal">Items</h3>
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
                      {item.productId ? (
                        <Link href={`/admin/products/${item.productId}/edit`} className="font-medium text-charcoal hover:underline">
                          {item.name}
                        </Link>
                      ) : (
                        <p className="font-medium text-charcoal">{item.name}</p>
                      )}
                      <p className="text-xs text-muted">{item.material}</p>
                      <p className="text-xs text-muted">Qty {item.quantity}</p>
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
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="flex flex-col gap-5 p-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg text-charcoal">Customer</h3>
                {order.customerId ? (
                  <Link
                    href="/admin/customers"
                    className="rounded-full bg-tangerine-50 px-2.5 py-0.5 text-xs font-medium text-tangerine-700 hover:underline"
                  >
                    Registered
                  </Link>
                ) : (
                  <span className="rounded-full bg-beige px-2.5 py-0.5 text-xs font-medium text-muted">Guest checkout</span>
                )}
              </div>
              <p className="mt-2 text-sm text-charcoal">{order.customerName}</p>
              <p className="text-sm text-muted">{order.customerEmail}</p>
              <p className="text-sm text-muted">{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="font-display text-lg text-charcoal">Shipping Address</h3>
              <p className="mt-2 text-sm text-charcoal">{order.addressLine}</p>
              <p className="text-sm text-charcoal">
                {order.city}, {order.pin}
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg text-charcoal">Payment</h3>
              <p className="mt-2 text-sm capitalize text-charcoal">{order.paymentMethod}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
