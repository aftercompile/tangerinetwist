// Creates (or refreshes) the letter-builder product behind /name-keychain. Safe to re-run:
// it upserts on the slug, so editing DEMO_BUILDER_CONFIG and running this again updates the
// product's settings in place. Builder products are excluded from every regular listing
// (see `notBuilder` in src/lib/db/queries.ts), so this does not add anything to the shop —
// it is only reachable through /name-keychain.
//
//   npx tsx scripts/seed-name-keychain.ts
import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function main() {
  const { db } = await import("../src/lib/db/index");
  const { categories, products } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { DEMO_BUILDER_CONFIG } = await import("../src/lib/letter-builder/demo-config");
  const { startingPrice } = await import("../src/lib/letter-builder/design");

  // categoryId is required; any existing category works since the product is never listed.
  const [home] = await db.select().from(categories).where(eq(categories.slug, "home-accents"));
  const category = home ?? (await db.select().from(categories).limit(1))[0];
  if (!category) throw new Error("No categories exist yet — create one first.");

  const values = {
    slug: "name-keychain",
    categoryId: category.id,
    name: "Custom Name Keychain",
    tagline: "Spell it in your colours",
    description:
      "A keychain or clicker that spells any name from individually printed letter beads or keycaps — you choose the colour of every bead, the colour of every letter, and the style.",
    story: "Every bead and key is printed to order in our studio in India, then strung or snapped together by hand.",
    price: startingPrice(DEMO_BUILDER_CONFIG),
    material: "Premium PLA",
    materials: ["Premium PLA", "Paracord", "Metal ring"],
    dimensions: "Beads about 2.5 cm each",
    weight: "About 30 g",
    colorway: "Your choice",
    finishTime: "Made to order, ships in 3–4 days",
    icon: "Sparkles",
    features: ["Choose every colour", "Three letter styles", "Keychain or clicker"],
    careInstructions: ["Wipe with a damp cloth", "Keep away from direct heat"],
    shippingInfo: ["Made to order — ships in 3–4 business days"],
    returnPolicy: ["Personalised pieces can't be returned, but anything that arrives damaged is replaced."],
    builderConfig: DEMO_BUILDER_CONFIG,
  };

  const [row] = await db
    .insert(products)
    .values(values)
    .onConflictDoUpdate({ target: products.slug, set: { builderConfig: values.builderConfig, price: values.price, updatedAt: new Date() } })
    .returning({ id: products.id, slug: products.slug, price: products.price });
  console.log("name-keychain product ready:", row.slug, "from ₹" + row.price);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
