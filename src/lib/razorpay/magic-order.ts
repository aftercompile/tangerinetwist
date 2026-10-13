// Pure helpers for Razorpay Magic Checkout — no database, no network, so they can be
// exercised with plain objects. The stateful parts (sessions, finalizing an order) live in
// magic-checkout.ts.
import { randomBytes } from "node:crypto";
import { normalizeIndianState } from "@/lib/pincode";
import { calculateTotals } from "@/lib/orders";

export function isMagicCheckoutEnabled(): boolean {
  return process.env.MAGIC_CHECKOUT_ENABLED === "true";
}

// The Razorpay order's `receipt` (max 40 chars) and our session's primary key. Random and
// unguessable on purpose: Razorpay's shipping/coupon callbacks are unauthenticated, so
// possession of a valid token is the only thing gating them.
export function newSessionToken(): string {
  return `mc_${randomBytes(18).toString("base64url")}`;
}

const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);
const paiseToRupees = (paise: number) => Math.round(paise / 100);

// ─── Creating the Razorpay order ────────────────────────────────────────────────────────

export interface MagicLineInput {
  name: string;
  slug: string;
  price: number; // rupees, per unit
  quantity: number;
  sku: string;
  catalogVariantId: number;
  description: string;
  imageUrl: string | null;
  // Letter-builder lines: tells two designs of the same product apart within one order.
  designKey?: string;
}

/**
 * Body for POST /v1/orders that makes Razorpay treat the order as a Magic Checkout order.
 * `line_items_total` is what flips it from Standard to Magic — without it Razorpay silently
 * falls back to Standard Checkout. `amount` is the items total only: shipping, COD fee and
 * any coupon are added by Razorpay inside its modal using our callbacks.
 */
export function buildMagicOrderPayload({
  token,
  siteUrl,
  lines,
}: {
  token: string;
  siteUrl: string;
  lines: MagicLineInput[];
}) {
  const lineItems = lines.map((l) => {
    const unit = rupeesToPaise(l.price);
    return {
      sku: l.sku,
      variant_id: l.designKey ? `${l.catalogVariantId}d${l.designKey}` : String(l.catalogVariantId),
      price: unit,
      offer_price: unit,
      quantity: l.quantity,
      name: l.name.slice(0, 120),
      // Razorpay requires a description; fall back to the name so it's never empty.
      description: (l.description || l.name).slice(0, 250),
      ...(l.imageUrl ? { image_url: l.imageUrl } : {}),
      product_url: `${siteUrl}/product/${l.slug}`,
    };
  });
  const total = lineItems.reduce((sum, l) => sum + l.offer_price * l.quantity, 0);

  return {
    amount: total,
    currency: "INR",
    receipt: token,
    line_items_total: total,
    line_items: lineItems,
  };
}

// ─── Razorpay's shipping callback ───────────────────────────────────────────────────────

export interface ShippingRequestAddress {
  id: string;
  zipcode: string;
  country?: string;
  state_code?: string;
}

/**
 * Shipping options for one address. We ship pan-India with one flat rule (the same one
 * calculateTotals applies everywhere else: free over the threshold, flat rate under it)
 * and no COD surcharge, so the only per-address decision is serviceability: an Indian,
 * well-formed PIN. Fees are paise, as Razorpay expects.
 */
export function shippingMethodsFor(subtotal: number, address: ShippingRequestAddress) {
  const serviceable =
    (address.country ?? "IN").toUpperCase() === "IN" && /^[1-9]\d{5}$/.test(String(address.zipcode ?? "").trim());
  const fee = calculateTotals(subtotal).shipping;
  return {
    id: String(address.id),
    zipcode: address.zipcode,
    country: (address.country ?? "IN").toUpperCase(),
    shipping_methods: [
      {
        id: "standard",
        name: "Standard delivery",
        description: fee === 0 ? "Free shipping" : "Flat-rate shipping",
        serviceable,
        shipping_fee: serviceable ? rupeesToPaise(fee) : 0,
        cod: serviceable,
        cod_fee: 0,
      },
    ],
  };
}

// ─── Reading a completed order back ─────────────────────────────────────────────────────

type Json = Record<string, unknown>;
const asObj = (v: unknown): Json => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {});
const asStr = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const asNum = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);
const firstStr = (...vals: unknown[]): string => vals.map(asStr).find(Boolean) ?? "";

// ISO 3166-2:IN codes, in case Razorpay returns a code rather than a name.
const STATE_CODES: Record<string, string> = {
  AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam",
  BR: "Bihar", CH: "Chandigarh", CG: "Chhattisgarh", DN: "Dadra and Nagar Haveli and Daman and Diu",
  DD: "Dadra and Nagar Haveli and Daman and Diu", DH: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi", GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
  JK: "Jammu and Kashmir", JH: "Jharkhand", KA: "Karnataka", KL: "Kerala", LA: "Ladakh",
  LD: "Lakshadweep", MP: "Madhya Pradesh", MH: "Maharashtra", MN: "Manipur", ML: "Meghalaya",
  MZ: "Mizoram", NL: "Nagaland", OD: "Odisha", OR: "Odisha", PY: "Puducherry", PB: "Punjab",
  RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TS: "Telangana", TG: "Telangana",
  TR: "Tripura", UP: "Uttar Pradesh", UK: "Uttarakhand", UT: "Uttarakhand", WB: "West Bengal",
};

export function resolveStateName(raw: string): string {
  if (!raw) return "";
  return STATE_CODES[raw.toUpperCase()] ?? normalizeIndianState(raw) ?? raw;
}

export interface MagicOrderDetails {
  // `incomplete` = no payment/COD placement on this order yet; nothing to record.
  kind: "paid" | "cod" | "incomplete";
  paymentId: string | null;
  method: "card" | "upi" | "netbanking" | "wallet" | "cod" | null;
  // All rupees.
  total: number;
  shipping: number; // shipping fee + COD fee
  discount: number;
  couponCode: string | null;
  customer: { name: string; email: string; phone: string };
  address: { line: string; city: string; state: string; pin: string };
  // Which of the fields we need were actually found — drives a loud log + admin-visible
  // placeholder rather than silently dropping a paid order over a field-name mismatch.
  missing: string[];
}

/**
 * Normalizes a fetched Magic order + its payments. Razorpay's docs name the fields we need
 * (`shipping_fee`, `cod_fee`, `promotions`, `customer_details`) but don't spell out the
 * address sub-fields, so address extraction accepts the plausible spellings and reports
 * what's missing instead of failing — money has already moved by the time this runs.
 */
export function extractMagicOrderDetails(orderRaw: unknown, paymentsRaw: unknown[]): MagicOrderDetails {
  const order = asObj(orderRaw);
  const payments = paymentsRaw.map(asObj);

  const okPayment = payments.find((p) => ["captured", "authorized"].includes(asStr(p.status)));
  const codPayment = payments.find((p) => asStr(p.method) === "cod" && asStr(p.status) !== "failed");
  const orderStatus = asStr(order.status);

  let kind: MagicOrderDetails["kind"] = "incomplete";
  if (orderStatus === "paid" || okPayment) kind = "paid";
  else if (orderStatus === "placed" || codPayment) kind = "cod";

  const payment = kind === "cod" ? codPayment ?? payments[0] : okPayment ?? payments[0];
  const rawMethod = asStr(payment?.method);
  const method: MagicOrderDetails["method"] =
    kind === "cod"
      ? "cod"
      : rawMethod === "card" || rawMethod === "upi" || rawMethod === "netbanking" || rawMethod === "wallet"
        ? rawMethod
        : null;

  const promotions = Array.isArray(order.promotions) ? order.promotions.map(asObj) : [];
  const discountPaise = promotions.reduce((sum, p) => sum + asNum(p.value), 0);

  const details = asObj(order.customer_details);
  const addr = asObj(details.shipping_address ?? details.billing_address);

  const name = firstStr(
    addr.name,
    [asStr(addr.first_name), asStr(addr.last_name)].filter(Boolean).join(" "),
    details.name
  );
  const line = [firstStr(addr.line1, addr.address_line1, addr.address, addr.street), firstStr(addr.line2, addr.address_line2)]
    .filter(Boolean)
    .join(", ");
  const city = firstStr(addr.city, addr.district);
  const state = resolveStateName(firstStr(addr.state, addr.state_code));
  const pin = firstStr(addr.zipcode, addr.pincode, addr.postal_code, addr.pin);
  const phone = firstStr(addr.contact, addr.phone, details.contact, payment?.contact);
  const email = firstStr(details.email, addr.email, payment?.email);

  const missing = Object.entries({ name, line, city, pin, phone, email })
    .filter(([, v]) => !v)
    .map(([k]) => k);

  // What was actually charged: the payment itself when we have it (for COD it already
  // includes any COD fee), else the order's own amount.
  const chargedPaise = asNum(payment?.amount) || asNum(order.amount_paid) || asNum(order.amount);

  return {
    kind,
    paymentId: payment ? asStr(payment.id) || null : null,
    method,
    total: paiseToRupees(chargedPaise),
    shipping: paiseToRupees(asNum(order.shipping_fee) + asNum(order.cod_fee)),
    discount: paiseToRupees(discountPaise),
    couponCode: asStr(promotions[0]?.code) || null,
    customer: { name, email, phone },
    address: { line, city, state, pin },
    missing,
  };
}
