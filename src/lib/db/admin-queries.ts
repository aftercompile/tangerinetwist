import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  categories as categoriesTable,
  customers as customersTable,
  orderItems as orderItemsTable,
  orders as ordersTable,
  productRelations as productRelationsTable,
  products as productsTable,
} from "./schema";

// Admin pages read the DB directly (uncached, always fresh) — unlike the storefront's
// unstable_cache-wrapped queries in queries.ts, which are tuned for public-page caching.

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: "in-stock" | "made-to-order" | "low-stock";
  badges: string[];
  categorySlug: string;
  categoryName: string;
  thumbnailSrc: string | null;
  thumbnailIcon: string;
  thumbnailTone: "warm" | "cool" | "charcoal" | "beige";
  rating: number;
  reviewCount: number;
  updatedAt: Date;
}

export async function getAdminProductRows(): Promise<AdminProductRow[]> {
  const rows = await db.query.products.findMany({
    with: {
      category: true,
      images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
    },
    orderBy: [desc(productsTable.updatedAt)],
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    stock: row.stock,
    badges: row.badges,
    categorySlug: row.category.slug,
    categoryName: row.category.name,
    thumbnailSrc: row.images[0]?.src || null,
    thumbnailIcon: row.images[0]?.icon ?? row.icon,
    thumbnailTone: row.images[0]?.tone ?? "beige",
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    updatedAt: row.updatedAt,
  }));
}

export interface AdminCategoryOption {
  id: string;
  slug: string;
  name: string;
}

export async function getAdminCategoryOptions(): Promise<AdminCategoryOption[]> {
  const rows = await db.select({ id: categoriesTable.id, slug: categoriesTable.slug, name: categoriesTable.name }).from(categoriesTable);
  return rows;
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  price: number;
  compareAtPrice: number | null;
  material: string;
  materials: string[];
  dimensions: string;
  weight: string;
  colorway: string;
  finishTime: string;
  icon: string;
  badges: string[];
  features: string[];
  careInstructions: string[];
  shippingInfo: string[];
  returnPolicy: string[];
  faqs: { question: string; answer: string }[];
  stock: "in-stock" | "made-to-order" | "low-stock";
  isPersonalized: boolean;
  images: { id: string; src: string; alt: string; tone: "warm" | "cool" | "charcoal" | "beige"; icon: string; position: number }[];
  relatedProductIds: string[];
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | undefined> {
  const row = await db.query.products.findFirst({
    where: eq(productsTable.id, id),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)] },
    },
  });
  if (!row) return undefined;

  const relations = await db
    .select({ relatedProductId: productRelationsTable.relatedProductId })
    .from(productRelationsTable)
    .where(eq(productRelationsTable.productId, id))
    .orderBy(productRelationsTable.position);

  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.categoryId,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    story: row.story,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    material: row.material,
    materials: row.materials,
    dimensions: row.dimensions,
    weight: row.weight,
    colorway: row.colorway,
    finishTime: row.finishTime,
    icon: row.icon,
    badges: row.badges,
    features: row.features,
    careInstructions: row.careInstructions,
    shippingInfo: row.shippingInfo,
    returnPolicy: row.returnPolicy,
    faqs: row.faqs,
    stock: row.stock,
    isPersonalized: row.isPersonalized,
    images: row.images.map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt,
      tone: img.tone,
      icon: img.icon,
      position: img.position,
    })),
    relatedProductIds: relations.map((r) => r.relatedProductId),
  };
}

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  heroIcon: string;
  material: string;
  productCount: number;
}

export async function getAdminCategoryRows(): Promise<AdminCategoryRow[]> {
  const rows = await db
    .select({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      shortName: categoriesTable.shortName,
      tagline: categoriesTable.tagline,
      description: categoriesTable.description,
      heroIcon: categoriesTable.heroIcon,
      material: categoriesTable.material,
      productCount: sql<number>`count(${productsTable.id})`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id);

  return rows.map((r) => ({ ...r, productCount: Number(r.productCount) }));
}

export interface AdminProductOption {
  id: string;
  slug: string;
  name: string;
}

export async function getAdminProductOptions(excludeId?: string): Promise<AdminProductOption[]> {
  const rows = await db.select({ id: productsTable.id, slug: productsTable.slug, name: productsTable.name }).from(productsTable);
  return excludeId ? rows.filter((r) => r.id !== excludeId) : rows;
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "in_production" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "cod";
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  createdAt: Date;
}

export async function getAdminOrderRows(): Promise<AdminOrderRow[]> {
  const rows = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      status: ordersTable.status,
      paymentStatus: ordersTable.paymentStatus,
      customerId: ordersTable.customerId,
      customerName: ordersTable.customerName,
      customerEmail: ordersTable.customerEmail,
      total: ordersTable.total,
      createdAt: ordersTable.createdAt,
      itemCount: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)`,
    })
    .from(ordersTable)
    .leftJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
    .groupBy(ordersTable.id)
    .orderBy(desc(ordersTable.createdAt));

  return rows.map((r) => ({ ...r, itemCount: Number(r.itemCount) }));
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "in_production" | "shipped" | "delivered" | "cancelled";
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine: string;
  city: string;
  state: string | null;
  pin: string;
  paymentMethod: "card" | "upi" | "cod" | "netbanking" | "wallet" | null;
  paymentStatus: "pending" | "paid" | "failed" | "cod";
  razorpayPaymentId: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: Date;
  shiprocketOrderId: string | null;
  shiprocketShipmentId: string | null;
  awbCode: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  shiprocketStatus: string | null;
  items: {
    id: string;
    productId: string | null;
    name: string;
    slug: string;
    price: number;
    material: string;
    imageSrc: string | null;
    imageIcon: string;
    imageTone: "warm" | "cool" | "charcoal" | "beige";
    quantity: number;
  }[];
}

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | undefined> {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) return undefined;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    addressLine: order.addressLine,
    city: order.city,
    state: order.state,
    pin: order.pin,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    razorpayPaymentId: order.razorpayPaymentId,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    createdAt: order.createdAt,
    shiprocketOrderId: order.shiprocketOrderId,
    shiprocketShipmentId: order.shiprocketShipmentId,
    awbCode: order.awbCode,
    courierName: order.courierName,
    trackingUrl: order.trackingUrl,
    shiprocketStatus: order.shiprocketStatus,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      slug: i.slug,
      price: i.price,
      material: i.material,
      imageSrc: i.imageSrc,
      imageIcon: i.imageIcon,
      imageTone: i.imageTone,
      quantity: i.quantity,
    })),
  };
}

export interface AdminCustomerRow {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  createdAt: Date;
  orderCount: number;
  lifetimeValue: number;
}

export async function getAdminCustomerRows(): Promise<AdminCustomerRow[]> {
  const rows = await db
    .select({
      id: customersTable.id,
      email: customersTable.email,
      fullName: customersTable.fullName,
      phone: customersTable.phone,
      createdAt: customersTable.createdAt,
      orderCount: sql<number>`count(${ordersTable.id})`,
      lifetimeValue: sql<number>`coalesce(sum(${ordersTable.total}), 0)`,
    })
    .from(customersTable)
    .leftJoin(ordersTable, eq(ordersTable.customerId, customersTable.id))
    .groupBy(customersTable.id)
    .orderBy(desc(customersTable.createdAt));

  return rows.map((r) => ({ ...r, orderCount: Number(r.orderCount), lifetimeValue: Number(r.lifetimeValue) }));
}
