import { existsSync } from "node:fs";
import { eachDayOfInterval, format, isWeekend, subDays } from "date-fns";
import {
  categories as categoriesTable,
  orderItems as orderItemsTable,
  orders as ordersTable,
  productImages as productImagesTable,
  productRelations as productRelationsTable,
  productReviews as productReviewsTable,
  products as productsTable,
} from "./schema";
import { categories } from "@/data/categories";
import { products } from "@/data/products";

// ./index (the postgres client) reads DATABASE_URL at module-evaluation time, and ESM
// hoists static imports ahead of this file's own statements — so the env file must be
// loaded via a dynamic import, after loadEnvFile runs, not a static import at the top.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function weightedStatus(daysAgo: number): "pending" | "confirmed" | "in_production" | "shipped" | "delivered" | "cancelled" {
  // Older orders have had time to complete; recent orders are still moving through the pipeline.
  if (daysAgo > 10) {
    const roll = Math.random();
    if (roll < 0.88) return "delivered";
    if (roll < 0.95) return "cancelled";
    return "shipped";
  }
  if (daysAgo > 5) return pick(["shipped", "in_production", "delivered"]);
  if (daysAgo > 2) return pick(["in_production", "confirmed"]);
  return pick(["pending", "confirmed"]);
}

const CUSTOMER_NAMES = [
  "Ananya Rao", "Karthik Menon", "Priya Sharma", "Rohan Gupta", "Ishita Patel",
  "Aditya Nair", "Sneha Iyer", "Arjun Reddy", "Divya Krishnan", "Vikram Singh",
  "Meera Joshi", "Rahul Verma", "Kavya Pillai", "Siddharth Rao", "Ananya Desai",
  "Nikhil Kumar", "Pooja Bhatt", "Aman Kapoor", "Riya Chatterjee", "Varun Malhotra",
];

const CITIES: Array<[string, string]> = [
  ["Bengaluru", "560001"], ["Chennai", "600001"], ["Mumbai", "400001"],
  ["Delhi", "110001"], ["Hyderabad", "500001"], ["Pune", "411001"],
  ["Kolkata", "700001"], ["Ahmedabad", "380001"], ["Jaipur", "302001"],
  ["Kochi", "682001"],
];

const PAYMENT_METHODS: Array<"card" | "upi" | "cod"> = ["upi", "upi", "card", "card", "cod"];

function calculateTotals(subtotal: number) {
  const shipping = subtotal >= 799 ? 0 : 79;
  return { shipping, total: subtotal + shipping };
}

async function main() {
  const { db } = await import("./index");

  console.log("Seeding categories...");
  const categoryIdBySlug = new Map<string, string>();
  for (const cat of categories) {
    const [row] = await db
      .insert(categoriesTable)
      .values({
        slug: cat.slug,
        name: cat.name,
        shortName: cat.shortName,
        tagline: cat.tagline,
        description: cat.description,
        heroIcon: cat.heroIcon,
        material: cat.material,
        heroStatement: cat.heroStatement,
        storyTitle: cat.storyTitle,
        storyBody: cat.storyBody,
        storyImage: cat.storyImage ?? null,
        journeySteps: cat.journeySteps,
        stats: cat.stats,
        lifestyleImage: cat.lifestyleImage ?? null,
        lifestyleHeadline: cat.lifestyleHeadline,
        lifestyleBody: cat.lifestyleBody,
        closingImage: cat.closingImage ?? null,
        closingHeadline: cat.closingHeadline,
        closingBody: cat.closingBody,
      })
      .returning({ id: categoriesTable.id });
    categoryIdBySlug.set(cat.slug, row.id);
  }

  console.log("Seeding products...");
  const productIdBySlug = new Map<string, string>();
  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) throw new Error(`Unknown category ${p.category} for product ${p.slug}`);

    const [row] = await db
      .insert(productsTable)
      .values({
        slug: p.slug,
        categoryId,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        story: p.story,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        currency: p.currency,
        material: p.material,
        materials: p.materials,
        dimensions: p.dimensions,
        weight: p.weight,
        colorway: p.colorway,
        finishTime: p.finishTime,
        icon: p.icon,
        rating: p.rating.toString(),
        reviewCount: p.reviewCount,
        badges: p.badges,
        styleTags: p.styleTags,
        colorTag: p.colorTag ?? null,
        sizeTier: p.sizeTier ?? null,
        features: p.features,
        careInstructions: p.careInstructions,
        shippingInfo: p.shippingInfo,
        returnPolicy: p.returnPolicy,
        faqs: p.faqs,
        stock: p.stock,
        isPersonalized: p.slug === "personalized-desk-name-plate",
        createdAt: new Date(p.createdAt),
      })
      .returning({ id: productsTable.id });
    productIdBySlug.set(p.slug, row.id);

    if (p.images.length > 0) {
      await db.insert(productImagesTable).values(
        p.images.map((img, i) => ({
          productId: row.id,
          src: img.src ?? "",
          alt: img.alt,
          tone: img.tone,
          icon: img.icon,
          position: i,
        }))
      );
    }

    if (p.reviews.length > 0) {
      await db.insert(productReviewsTable).values(
        p.reviews.map((rev) => ({
          productId: row.id,
          author: rev.author,
          location: rev.location,
          rating: rev.rating,
          title: rev.title,
          body: rev.body,
          verified: rev.verified,
        }))
      );
    }
  }

  console.log("Seeding product relations...");
  for (const p of products) {
    const productId = productIdBySlug.get(p.slug)!;
    const relatedIds = p.relatedSlugs
      .map((slug) => productIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id));
    if (relatedIds.length > 0) {
      await db.insert(productRelationsTable).values(
        relatedIds.map((relatedProductId, i) => ({
          productId,
          relatedProductId,
          position: i,
        }))
      );
    }
  }

  console.log("Seeding ~90 days of demo orders...");
  const seededProducts = products.map((p) => ({
    id: productIdBySlug.get(p.slug)!,
    slug: p.slug,
    name: p.name,
    price: p.price,
    material: p.material,
    imageSrc: p.images[0]?.src ?? null,
    imageIcon: p.icon,
    imageTone: p.images[0]?.tone ?? ("beige" as const),
  }));

  const today = new Date();
  const start = subDays(today, 90);
  const days = eachDayOfInterval({ start, end: today });

  let orderSeq = 0;
  const orderRows: (typeof ordersTable.$inferInsert)[] = [];
  const orderItemsByOrder: Array<(typeof orderItemsTable.$inferInsert)[]> = [];

  for (const day of days) {
    const daysAgo = Math.max(0, Math.floor((today.getTime() - day.getTime()) / 86_400_000));
    // Mild upward trend: more recent days get slightly more volume; weekends run busier.
    const trendFactor = 1 + (90 - daysAgo) / 180;
    const weekendFactor = isWeekend(day) ? 1.4 : 1;
    const baseOrders = randomInt(1, 3) * trendFactor * weekendFactor;
    const orderCount = Math.max(0, Math.round(baseOrders));

    for (let i = 0; i < orderCount; i++) {
      orderSeq += 1;
      const itemCount = randomInt(1, 3);
      const chosen = new Set<number>();
      while (chosen.size < itemCount) chosen.add(randomInt(0, seededProducts.length - 1));

      const items = Array.from(chosen).map((idx) => {
        const product = seededProducts[idx];
        return { product, quantity: randomInt(1, 2) };
      });

      const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
      const { shipping, total } = calculateTotals(subtotal);
      const [city, pin] = pick(CITIES);
      const hour = randomInt(9, 21);
      const minute = randomInt(0, 59);
      const createdAt = new Date(day);
      createdAt.setHours(hour, minute, 0, 0);

      const orderNumber = `TT-${format(createdAt, "yyMM")}-${String(orderSeq).padStart(4, "0")}`;

      orderRows.push({
        orderNumber,
        status: weightedStatus(daysAgo),
        customerName: pick(CUSTOMER_NAMES),
        customerEmail: `${pick(CUSTOMER_NAMES).toLowerCase().replace(/\s+/g, ".")}@example.com`,
        customerPhone: `9${randomInt(100000000, 999999999)}`,
        addressLine: `${randomInt(1, 200)}, ${pick(["MG Road", "Park Street", "Church Street", "Brigade Road", "Linking Road", "Residency Road"])}`,
        city,
        pin,
        paymentMethod: pick(PAYMENT_METHODS),
        subtotal,
        shipping,
        total,
        createdAt,
      });

      orderItemsByOrder.push(
        items.map((it) => ({
          orderId: "", // filled in after insert
          productId: it.product.id,
          name: it.product.name,
          slug: it.product.slug,
          price: it.product.price,
          material: it.product.material,
          imageSrc: it.product.imageSrc,
          imageIcon: it.product.imageIcon,
          imageTone: it.product.imageTone,
          quantity: it.quantity,
        }))
      );
    }
  }

  console.log(`Inserting ${orderRows.length} orders...`);
  for (let i = 0; i < orderRows.length; i++) {
    const [orderRow] = await db.insert(ordersTable).values(orderRows[i]).returning({ id: ordersTable.id });
    await db.insert(orderItemsTable).values(
      orderItemsByOrder[i].map((item) => ({ ...item, orderId: orderRow.id }))
    );
  }

  console.log("Done.");
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`Orders: ${orderRows.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
