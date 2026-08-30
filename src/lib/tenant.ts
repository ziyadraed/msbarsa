import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Multi-tenant helpers.
 *
 * Every merchant-facing query must be scoped to a store (tenant) to keep data
 * isolated between merchants — this is the non-negotiable platform rule.
 */

export const DEFAULT_STORE_SLUG = "msbarsa";

/** Resolve a store id from its slug (subdomain), defaulting to the flagship store. */
export async function getStoreId(slug?: string): Promise<string> {
  const target = slug || DEFAULT_STORE_SLUG;
  try {
    const rows = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.slug, target))
      .limit(1);
    if (rows.length) return rows[0].id;
  } catch {
    // DB unavailable — callers fall back to seed catalog.
  }
  // Fallback deterministic pseudo-id so the storefront still renders offline.
  return `store-${target}`;
}

/** Fetch full store row by slug or id. */
export async function getStoreBySlug(slug: string) {
  try {
    const rows = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Create a brand new tenant store (used by merchant onboarding + platform admin). */
export async function createStore(input: {
  slug: string;
  name: string;
  ownerId?: string;
  email?: string;
  plan?: string;
}) {
  const [row] = await db
    .insert(stores)
    .values({
      slug: input.slug,
      name: input.name,
      ownerId: input.ownerId,
      email: input.email ?? "",
      plan: input.plan ?? "free",
    })
    .returning();
  return row;
}
