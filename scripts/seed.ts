import "dotenv/config";
import { db } from "../src/db";
import { stores, users, storeMembers, categories, products, customers } from "../src/db/schema";
import { CATEGORIES, PRODUCTS } from "../src/lib/catalog";
import { hashPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function main() {
  // 1) Flagship store (tenant)
  let store = (await db.select().from(stores).where(eq(stores.slug, "msbarsa")).limit(1))[0];
  if (!store) {
    const rows = await db
      .insert(stores)
      .values({ slug: "msbarsa", name: "مسبار", email: "admin@msbarsa.app", plan: "pro" })
      .returning();
    store = rows[0];
    console.log("Created flagship store:", store.id);
  } else {
    console.log("Flagship store exists:", store.id);
  }

  // 2) Platform admin
  let admin = (await db.select().from(users).where(eq(users.email, "admin@msbarsa.app")).limit(1))[0];
  if (!admin) {
    admin = (
      await db
        .insert(users)
        .values({
          name: "مشرف المنصة",
          email: "admin@msbarsa.app",
          passwordHash: hashPassword("admin123"),
          role: "admin",
        })
        .returning()
    )[0];
    console.log("Created platform admin: admin@msbarsa.app / admin123");
  }

  // 3) Demo merchant owning the flagship store
  let merchant = (await db.select().from(users).where(eq(users.email, "merchant@msbarsa.app")).limit(1))[0];
  if (!merchant) {
    merchant = (
      await db
        .insert(users)
        .values({
          name: "تاجر مسبار",
          email: "merchant@msbarsa.app",
          passwordHash: hashPassword("merchant123"),
          role: "merchant",
          storeId: store.id,
        })
        .returning()
    )[0];
    await db.insert(storeMembers).values({ storeId: store.id, userId: merchant.id, role: "owner" });
    console.log("Created demo merchant: merchant@msbarsa.app / merchant123");
  }

  // 4) Seed categories scoped to store
  console.log("Seeding categories...");
  for (const c of CATEGORIES) {
    await db
      .insert(categories)
      .values({
        storeId: store.id,
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        icon: c.icon,
        tint: c.tint,
        sort: c.sort,
      })
      .onConflictDoNothing();
  }

  // 5) Seed products scoped to store
  console.log("Seeding products...");
  for (const p of PRODUCTS) {
    await db
      .insert(products)
      .values({
        id: p.id,
        storeId: store.id,
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
        images: [],
      })
      .onConflictDoNothing();
  }

  // 6) A few demo customers scoped to store
  const demoCustomers = [
    { name: "أحمد علي", email: "ahmed@example.com", totalSpent: 199, orderCount: 1 },
    { name: "سارة محمد", email: "sara@example.com", totalSpent: 449, orderCount: 2 },
  ];
  for (const c of demoCustomers) {
    await db
      .insert(customers)
      .values({ storeId: store.id, name: c.name, email: c.email, totalSpent: c.totalSpent, orderCount: c.orderCount })
      .onConflictDoNothing();
  }

  console.log(`Done. ${CATEGORIES.length} categories, ${PRODUCTS.length} products, 2 demo customers.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
