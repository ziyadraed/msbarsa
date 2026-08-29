import "dotenv/config";
import { db } from "../src/db";
import { categories, products } from "../src/db/schema";
import { CATEGORIES, PRODUCTS } from "../src/lib/catalog";

async function main() {
  console.log("Seeding categories...");
  for (const c of CATEGORIES) {
    await db
      .insert(categories)
      .values({ slug: c.slug, name: c.name, tagline: c.tagline, icon: c.icon, tint: c.tint, sort: c.sort })
      .onConflictDoNothing();
  }

  console.log("Seeding products...");
  for (const p of PRODUCTS) {
    await db
      .insert(products)
      .values({
        id: p.id,
        slug: p.slug,
        categorySlug: p.categorySlug,
        name: p.name,
        latinName: p.latinName,
        shortDesc: p.shortDesc,
        longDesc: p.longDesc,
        features: p.features,
        licenseType: p.licenseType,
        devices: p.devices,
        duration: p.duration,
        price: p.price,
        comparePrice: p.comparePrice,
        rating: p.rating,
        ratingCount: p.ratingCount,
        badge: p.badge,
        isDeal: p.isDeal,
        stock: p.stock,
        sort: p.sort,
      })
      .onConflictDoNothing();
  }
  console.log(`Done. ${CATEGORIES.length} categories, ${PRODUCTS.length} products.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
