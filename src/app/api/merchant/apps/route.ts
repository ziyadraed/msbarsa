import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const ALL_APP_IDS = ["analytics", "email", "campaigns", "wallet", "support", "inventory"];

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
  const rows = await db.select({ settings: stores.settings }).from(stores).where(eq(stores.id, storeId)).limit(1);
  const s = (rows[0]?.settings ?? {}) as Record<string, unknown>;
  return Response.json({ installed: Array.isArray(s.installedApps) ? s.installedApps : [] });
}

export async function PATCH(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    let installed = Array.isArray(body?.installed) ? body.installed.filter((x: string) => typeof x === "string") : [];
    installed = installed.filter((x: string) => ALL_APP_IDS.includes(x));
    const rows = await db.select({ settings: stores.settings }).from(stores).where(eq(stores.id, storeId)).limit(1);
    const s = (rows[0]?.settings ?? {}) as Record<string, unknown>;
    await db.update(stores).set({ settings: { ...s, installedApps: installed } }).where(eq(stores.id, storeId));
    return Response.json({ ok: true, installed });
  } catch {
    return Response.json({ error: "تعذر الحفظ" }, { status: 500 });
  }
}
