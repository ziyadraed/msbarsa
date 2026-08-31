import { gatewayConfig } from "@/lib/payments";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

// Returns the gateway config the checkout should use. Priority:
//   1. Keys the merchant saved in /merchant/payments (store settings).
//   2. Fallback to server environment keys (MOYASAR_*).
export async function GET() {
  const base = gatewayConfig();
  const storeId = await getStoreId();
  try {
    if (storeId) {
      const rows = await db.select({ settings: stores.settings }).from(stores).where(eq(stores.id, storeId)).limit(1);
      const s = (rows[0]?.settings ?? {}) as Record<string, unknown>;
      const gw = (s.gateway ?? {}) as Record<string, unknown>;
      const pk = String(gw.publishableKey ?? "").trim();
      const sk = String(gw.secretKey ?? "").trim();
      if (pk && sk) {
        return Response.json({ enabled: true, publishableKey: pk, currency: "SAR", merchantConfigured: true });
      }
    }
  } catch {
    // fall through to env config
  }
  return Response.json({
    enabled: base.enabled,
    publishableKey: base.enabled ? base.publishableKey : null,
    currency: base.currency,
    merchantConfigured: false,
  });
}
