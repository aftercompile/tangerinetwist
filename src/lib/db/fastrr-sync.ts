import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { orders, orderItems, products } from "@/lib/db/schema";
import { fastrrFetch } from "@/lib/fastrr/client";
import { getCurrentCustomer } from "@/lib/auth/customer-guard";

// Our own human-readable order reference, independent of whatever id Fastrr assigns —
// used in admin UI and customer-facing order confirmations. Server-only (this whole
// module is), unlike src/lib/orders.ts which is also imported by client components.
function generateOrderNumber(): string {
  return `TT-${new Date().toISOString().slice(2, 7).replace("-", "")}-${randomUUID().split("-")[0].toUpperCase()}`;
}

interface FastrrOrderDetails {
  ok: boolean;
  result: {
    order_id: string;
    cart_data: { items: { variant_id: string; quantity: number }[] };
    status: "CREATED" | "INITIATED" | "FAILED" | "SUCCESS";
    phone: string;
    email: string;
    shipping_address: {
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      pincode: string;
      state: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    payment_type: "CASH_ON_DELIVERY" | "PREPAID";
    payment_status: "Pending" | "Success" | "Failed";
    payments?: { payment_method: string; amount: number }[];
    shipping_charges: number | null;
    subtotal_price: number;
    total_amount_payable: number;
  };
}

function mapPaymentMethod(raw: string | undefined): "card" | "upi" | "netbanking" | "wallet" | null {
  const lower = raw?.toLowerCase();
  if (lower === "card" || lower === "upi" || lower === "netbanking" || lower === "wallet") return lower;
  return null;
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

// The one place that turns a Fastrr order id into a row in our own `orders` table —
// called both by the order webhook and by the /checkout landing page (the redirect
// target), so the two paths can't drift apart. Always re-fetches from Fastrr's signed
// Order/Details API rather than trusting whatever triggered it (an unauthenticated
// webhook body, or a URL query param) — same "never trust the client" principle already
// applied to cart pricing and payment verification elsewhere in this app.
export async function syncFastrrOrder(fastrrOrderId: string): Promise<{ error?: string; orderNumber?: string }> {
  const [existing] = await db.select().from(orders).where(eq(orders.fastrrOrderId, fastrrOrderId));
  if (existing) {
    return { orderNumber: existing.orderNumber };
  }

  let details: FastrrOrderDetails;
  try {
    details = await fastrrFetch<FastrrOrderDetails>("/api/v1/custom-platform-order/details", {
      order_id: fastrrOrderId,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not fetch order details." };
  }

  const result = details.result;
  if (result.status !== "SUCCESS") {
    // CREATED/INITIATED = checkout still in progress; FAILED = customer never
    // completed it. Neither is a real order — nothing to record yet.
    return { error: `Order not yet completed (status: ${result.status}).` };
  }

  const variantIds = result.cart_data.items.map((i) => Number(i.variant_id));
  const productRows = await db.query.products.findMany({
    where: inArray(products.externalId, variantIds),
    with: { images: { orderBy: (img, { asc }) => [asc(img.position)] } },
  });
  const byExternalId = new Map(productRows.map((p) => [p.externalId, p]));

  const orderItemRows = result.cart_data.items.flatMap((item) => {
    const product = byExternalId.get(Number(item.variant_id));
    if (!product) return []; // stale/deleted product — skip rather than fail the whole order
    const primaryImage = product.images[0];
    return [
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        material: product.material,
        imageSrc: primaryImage?.src ?? null,
        imageIcon: primaryImage?.icon ?? product.icon,
        imageTone: primaryImage?.tone ?? ("beige" as const),
        quantity: item.quantity,
      },
    ];
  });

  const isCod = result.payment_type === "CASH_ON_DELIVERY";
  const paymentStatus = isCod ? "cod" : result.payment_status === "Success" ? "paid" : result.payment_status === "Failed" ? "failed" : "pending";
  const paymentMethod = isCod ? ("cod" as const) : mapPaymentMethod(result.payments?.[0]?.payment_method);

  const customer = await getCurrentCustomer();
  const orderNumber = generateOrderNumber();
  const addressLine = result.shipping_address.line2
    ? `${result.shipping_address.line1}, ${result.shipping_address.line2}`
    : result.shipping_address.line1;

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        status: "confirmed",
        customerId: customer?.id ?? null,
        customerName: `${result.shipping_address.first_name} ${result.shipping_address.last_name}`.trim(),
        customerEmail: result.email || result.shipping_address.email,
        customerPhone: result.phone || result.shipping_address.phone,
        addressLine,
        city: result.shipping_address.city,
        state: result.shipping_address.state,
        pin: result.shipping_address.pincode,
        paymentMethod,
        paymentStatus,
        fastrrOrderId,
        checkoutSource: "fastrr",
        subtotal: Math.round(result.subtotal_price),
        shipping: Math.round(result.shipping_charges ?? 0),
        total: Math.round(result.total_amount_payable),
      })
      .returning({ id: orders.id });

    if (orderItemRows.length > 0) {
      await tx.insert(orderItems).values(orderItemRows.map((item) => ({ ...item, orderId: order.id })));
    }

    return order.id;
  });

  revalidateOrderPaths(orderId);
  return { orderNumber };
}
