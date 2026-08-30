import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, like, or, desc, asc, sql, and } from "drizzle-orm";
import { getStoreId } from "./tenant";
import { CATEGORIES, PRODUCTS, fallbackProducts, fallbackProduct, type Category, type Product } from "./catalog";

export type { Category, Product };

export async function getCategories(storeSlug?: string): Promise<Category[]> {
  try {
    const storeId = await getStoreId(storeSlug);
    const rows = await db.select().from(categories).where(eq(categories.storeId, storeId));
    if (rows.length === 0) return CATEGORIES;
    return rows
      .map((r) => ({ slug: r.slug, name: r.name, tagline: r.tagline, icon: r.icon, tint: r.tint, sort: r.sort }))
      .sort((a, b) => a.sort - b.sort);
  } catch {
    return CATEGORIES;
  }
}

type DbProductRow = typeof products.$inferSelect;

function rowToProduct(r: DbProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    categorySlug: r.categorySlug,
    name: r.name,
    latinName: r.latinName,
    shortDesc: r.shortDesc,
    longDesc: r.longDesc,
    features: Array.isArray(r.features) ? r.features : [],
    licenseType: r.licenseType,
    devices: r.devices,
    duration: r.duration,
    price: r.price,
    comparePrice: r.comparePrice,
    rating: r.rating,
    ratingCount: r.ratingCount,
    badge: r.badge,
    isDeal: r.isDeal,
    stock: r.stock,
    sort: r.sort,
  };
}

export async function getProducts(
  opts?: { category?: string; q?: string; deals?: boolean; sort?: string; storeSlug?: string }
): Promise<Product[]> {
  try {
    const storeId = await getStoreId(opts?.storeSlug);
    const conds: any[] = [eq(products.storeId, storeId)];
    if (opts?.category) conds.push(eq(products.categorySlug, opts.category));
    if (opts?.deals) conds.push(eq(products.isDeal, true));
    if (opts?.q) {
      const p = `%${opts.q}%`;
      conds.push(or(like(products.name, p), like(products.latinName, p), like(products.shortDesc, p)));
    }
    const where: any = and(...conds);
    let rows;
    switch (opts?.sort) {
      case "price-asc":
        rows = await db.select().from(products).where(where).orderBy(asc(products.price));
        break;
      case "price-desc":
        rows = await db.select().from(products).where(where).orderBy(desc(products.price));
        break;
      case "rating":
        rows = await db.select().from(products).where(where).orderBy(desc(products.rating));
        break;
      default:
        rows = await db.select().from(products).where(where).orderBy(asc(products.sort));
    }
    if (rows.length === 0 && !opts?.q) return fallbackProducts(opts);
    if (rows.length > 0) {
      const mapped = rows.map(rowToProduct);
      if (opts?.sort === "discount") {
        mapped.sort((a, b) => ((b.comparePrice ?? b.price) - b.price) - ((a.comparePrice ?? a.price) - a.price));
      }
      return mapped;
    }
    return [];
  } catch {
    return fallbackProducts(opts);
  }
}

export async function getProduct(slug: string, storeSlug?: string): Promise<Product | undefined> {
  try {
    const storeId = await getStoreId(storeSlug);
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.slug, slug)))
      .limit(1);
    if (rows.length) return rowToProduct(rows[0]);
    return fallbackProduct(slug);
  } catch {
    return fallbackProduct(slug);
  }
}

/** Authoritative price lookup used by checkout — never trust client prices. */
export async function priceMap(storeSlug?: string): Promise<Record<string, Product>> {
  const all = await getProducts({ storeSlug });
  return Object.fromEntries(all.map((p) => [p.slug, p]));
}

export { PRODUCTS as SEED_PRODUCTS, CATEGORIES as SEED_CATEGORIES };
