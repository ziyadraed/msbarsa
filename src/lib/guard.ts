import { redirect } from "next/navigation";
import { getSessionUser, type SafeUser } from "./auth";
import { db } from "@/db";
import { storeMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Resolve the store a merchant operates in (their owned store, or a store they're a member of). */
async function resolveMerchantStoreId(user: SafeUser): Promise<string | null> {
  if (user.storeId) return user.storeId;
  try {
    const rows = await db
      .select({ storeId: storeMembers.storeId })
      .from(storeMembers)
      .where(eq(storeMembers.userId, user.id))
      .limit(1);
    return rows[0]?.storeId ?? null;
  } catch {
    return null;
  }
}

/**
 * Require the session user to hold one of the given roles; otherwise redirect.
 * Returns the user and (for merchants) their storeId.
 */
export async function requireRole(
  allowed: ("customer" | "merchant" | "admin")[],
  redirectTo = "/login"
): Promise<{ user: SafeUser; storeId: string | null }> {
  const user = await getSessionUser();
  if (!user || !allowed.includes(user.role)) {
    redirect(redirectTo);
  }
  const storeId = user.role === "admin" ? (user.storeId ?? null) : await resolveMerchantStoreId(user);
  return { user, storeId };
}
