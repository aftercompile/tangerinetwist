import { relations } from "drizzle-orm";
import {
  bigserial,
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Unmanaged reference to Supabase Auth's own users table — never migrated/created by us
// (Supabase owns it), declared only so customers.id can carry a real FK constraint into it.
const authSchema = pgSchema("auth");
const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const stockStatusEnum = pgEnum("stock_status", [
  "in-stock",
  "made-to-order",
  "low-stock",
]);

export const imageToneEnum = pgEnum("image_tone", ["warm", "cool", "charcoal", "beige"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
]);

// "card"/"upi" were once customer-chosen radio options; now Razorpay's own checkout
// modal picks between them (plus netbanking/wallet), and we just store whichever it
// reports after payment. Values are additive only — never remove one, existing rows use them.
export const paymentMethodEnum = pgEnum("payment_method", ["card", "upi", "cod", "netbanking", "wallet"]);

// Independent from orderStatusEnum (which tracks fulfillment) — this tracks whether money
// has actually moved. "cod" orders start and stay here until delivery/collection; online
// orders start "pending" the moment Razorpay checkout opens and only become "paid" once a
// signature-verified confirmation (client callback or webhook) arrives.
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "cod"]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Same reasoning as products.externalId — Fastrr's catalog sync expects a unique
  // numeric "long" id per collection, Shopify-style.
  externalId: bigserial("external_id", { mode: "number" }).notNull().unique(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  heroIcon: text("hero_icon").notNull(),
  material: text("material").notNull(),
  // Everything below powers the editorial category-page redesign. All nullable/defaulted
  // so an admin-created category with none of it filled in just renders without these
  // sections (each component checks its own content and returns null) instead of breaking.
  heroStatement: text("hero_statement").notNull().default(""),
  storyTitle: text("story_title").notNull().default(""),
  storyBody: text("story_body").notNull().default(""),
  storyImage: text("story_image"),
  journeySteps: jsonb("journey_steps").$type<string[]>().notNull().default([]),
  stats: jsonb("stats").$type<{ label: string; icon: string }[]>().notNull().default([]),
  lifestyleImage: text("lifestyle_image"),
  lifestyleHeadline: text("lifestyle_headline").notNull().default(""),
  lifestyleBody: text("lifestyle_body").notNull().default(""),
  closingImage: text("closing_image"),
  closingHeadline: text("closing_headline").notNull().default(""),
  closingBody: text("closing_body").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Fastrr by Shiprocket Checkout's catalog sync expects a unique numeric ("long") id per
  // product/variant, Shopify-style — our real primary key is a UUID, so this is a separate
  // auto-incrementing id exposed only to that catalog feed, never used internally.
  externalId: bigserial("external_id", { mode: "number" }).notNull().unique(),
  slug: text("slug").notNull().unique(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  story: text("story").notNull(),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  currency: text("currency").notNull().default("INR"),
  material: text("material").notNull(),
  // jsonb: pure copy blocks, never individually queried/ordered — see schema notes below
  materials: jsonb("materials").$type<string[]>().notNull().default([]),
  dimensions: text("dimensions").notNull(),
  weight: text("weight").notNull(),
  colorway: text("colorway").notNull(),
  finishTime: text("finish_time").notNull(),
  icon: text("icon").notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  // real array (not jsonb): getBestSellers/getNewArrivals filter on this, backed by a GIN index
  badges: text("badges").array().notNull().default([]),
  // Same real-array pattern as badges — the category page's floating filter chips are
  // computed from whatever distinct values are actually present, never hardcoded, so a
  // future category with different style tags gets correct chips automatically.
  styleTags: text("style_tags").array().notNull().default([]),
  colorTag: text("color_tag"),
  sizeTier: text("size_tier"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  careInstructions: jsonb("care_instructions").$type<string[]>().notNull().default([]),
  shippingInfo: jsonb("shipping_info").$type<string[]>().notNull().default([]),
  returnPolicy: jsonb("return_policy").$type<string[]>().notNull().default([]),
  faqs: jsonb("faqs").$type<{ question: string; answer: string }[]>().notNull().default([]),
  stock: stockStatusEnum("stock").notNull().default("in-stock"),
  isPersonalized: boolean("is_personalized").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  src: text("src").notNull(),
  alt: text("alt").notNull().default(""),
  tone: imageToneEnum("tone").notNull().default("beige"),
  icon: text("icon").notNull(),
  position: integer("position").notNull().default(0),
});

export const productReviews = pgTable(
  "product_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    // Null for the seed/marketing reviews written before this feature existed. Set for
    // every review submitted through submitProductReviewAction — "set null" (not
    // cascade) so a review stays visible on the product page even if the customer's
    // account is ever removed, same preserve-history principle as orderItems.productId.
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    author: text("author").notNull(),
    location: text("location").notNull(),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // One review per customer per product. NULLs (the legacy seed rows) are each
    // treated as distinct by Postgres, so this only constrains real customer reviews.
    oneReviewPerCustomer: unique().on(table.productId, table.customerId),
  })
);

// Replaces relatedSlugs: string[] with real referential integrity —
// a deleted product cascades its relation rows instead of leaving dangling slugs.
export const productRelations = pgTable("product_relations", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  relatedProductId: uuid("related_product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
});

// One row per Supabase Auth user — id matches auth.users.id exactly (no separate identity).
// Rows are created lazily on first sign-in/sign-up via the customer-auth server actions.
export const customers = pgTable("customers", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  // Nullable: rows saved before the Shiprocket integration added this field won't have it.
  state: text("state"),
  pin: text("pin").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").notNull().default("pending"),
  // Null for guest checkout — never required, never client-supplied (see placeOrder).
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  // Nullable: orders placed before the Shiprocket integration won't have it. Required by
  // Shiprocket's order-create API (billing_state), so enforced going forward in
  // shippingDetailsSchema instead of at the column level.
  state: text("state"),
  pin: text("pin").notNull(),
  // Nullable: for an online-payment order this isn't known until Razorpay reports which
  // method the customer actually used (card/upi/netbanking/wallet) — "cod" is set
  // immediately since there's nothing to wait for.
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  // Legacy — the direct Razorpay checkout these powered has been replaced by Fastrr,
  // which now owns payment collection. Left in place (nullable, unused by new orders)
  // since historical rows still reference them; not worth a destructive migration.
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  // Fastrr's own order id (the "oid" in the redirect_url and the webhook payload) — the
  // key used to fetch authoritative order/payment details and to de-dupe webhook retries.
  fastrrOrderId: text("fastrr_order_id").unique(),
  // "fastrr" for every order going forward; null on historical pre-Fastrr rows.
  checkoutSource: text("checkout_source"),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // All null until an admin pushes the order to Shiprocket via ShiprocketPanel.
  shiprocketOrderId: text("shiprocket_order_id"),
  shiprocketShipmentId: text("shiprocket_shipment_id"),
  awbCode: text("awb_code"),
  courierName: text("courier_name"),
  trackingUrl: text("tracking_url"),
  shiprocketStatus: text("shiprocket_status"),
  // Generated automatically at ship time (see shipOrderViaShiprocket) — null only if
  // that generation call itself failed, in which case the admin panel falls back to
  // generating (and persisting) it on demand.
  invoiceUrl: text("invoice_url"),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // set null (not cascade): deleting a product must not erase historical sales data
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  price: integer("price").notNull(),
  material: text("material").notNull(),
  imageSrc: text("image_src"),
  imageIcon: text("image_icon").notNull(),
  imageTone: imageToneEnum("image_tone").notNull().default("beige"),
  quantity: integer("quantity").notNull(),
});

// One row per Shiprocket tracking checkpoint (Shipped, In Transit, Out for Delivery,
// Delivered, ...). Ingestion is always replace-all for an order — both the webhook and
// the manual refresh button delete this order's rows and re-insert Shiprocket's current
// full history, rather than trying to append/dedupe against what's already stored.
export const orderTrackingEvents = pgTable("order_tracking_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  activity: text("activity"),
  location: text("location"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  // "webhook" | "manual_refresh" | "ship" — which path recorded this, for debugging.
  source: text("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  reviews: many(productReviews),
  relatedTo: many(productRelations, { relationName: "product" }),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  customer: one(customers, {
    fields: [productReviews.customerId],
    references: [customers.id],
  }),
}));

export const productRelationsRelations = relations(productRelations, ({ one }) => ({
  product: one(products, {
    fields: [productRelations.productId],
    references: [products.id],
    relationName: "product",
  }),
  relatedProduct: one(products, {
    fields: [productRelations.relatedProductId],
    references: [products.id],
    relationName: "relatedProduct",
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  items: many(orderItems),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  trackingEvents: many(orderTrackingEvents),
}));

export const orderTrackingEventsRelations = relations(orderTrackingEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderTrackingEvents.orderId],
    references: [orders.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  addresses: many(customerAddresses),
  reviews: many(productReviews),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  customer: one(customers, {
    fields: [customerAddresses.customerId],
    references: [customers.id],
  }),
}));
