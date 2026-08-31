import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";
import { gatewayConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

async function merchantStore() {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "غير مصرح" }, { status: 401 }), storeId: "" };
  if (user.role !== "merchant" && user.role !== "admin")
    return { error: Response.json({ error: "صلاحية غير كافية" }, { status: 403 }), storeId: "" };
  const storeId = user.storeId ?? (await getStoreId());
  if (!storeId) return { error: Response.json({ error: "لا يوجد متجر مرتبط" }, { status: 400 }), storeId: "" };
  return { error: null, storeId };
}

export async function GET() {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const env = gatewayConfig();
  try {
    const rows = await db.select({ settings: stores.settings }).from(stores).where(eq(stores.id, storeId)).limit(1);
    const s = (rows[0]?.settings ?? {}) as Record<string, unknown>;
    const gw = (s.gateway ?? {}) as Record<string, unknown>;
    return Response.json({
      methods: Array.isArray(gw.methods) ? gw.methods : [],
      publishableKey: String(gw.publishableKey ?? ""),
      secretKey: String(gw.secretKey ?? ""),
      envKeysConfigured: env.enabled,
      merchantConfigured: !!(gw.publishableKey && gw.secretKey),
    });
  } catch {
    return Response.json({ methods: [], publishableKey: "", secretKey: "", envKeysConfigured: env.enabled, merchantConfigured: false });
  }
}

export async function PATCH(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const publishableKey = String(body?.publishableKey ?? "").trim();
    const secretKey = String(body?.secretKey ?? "").trim();
    const methods = Array.isArray(body?.methods) ? body.methods.filter((m: string) => typeof m === "string") : [];

    const rows = await db.select({ settings: stores.settings }).from(stores).where(eq(stores.id, storeId)).limit(1);
    const s = (rows[0]?.settings ?? {}) as Record<string, unknown>;
    const gw = (s.gateway ?? {}) as Record<string, unknown>;

    const nextGateway = {
      ...(typeof gw === "object" ? gw : {}),
      publishableKey,
      secretKey,
      methods,
    };

    await db
      .update(stores)
      .set({ settings: { ...s, gateway: nextGateway } })
      .where(eq(stores.id, storeId));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر حفظ إعدادات الدفع" }, { status: 500 });
  }
}
