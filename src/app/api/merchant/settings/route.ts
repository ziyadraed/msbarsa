import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

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
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store.length) return Response.json({ error: "غير موجود" }, { status: 404 });
  return Response.json({ store: store[0] });
}

export async function PATCH(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    if (name.length < 2) return Response.json({ error: "اسم المتجر مطلوب" }, { status: 400 });
    // Merge extra design/appearance settings into the store's settings jsonb.
    const design = body?.design && typeof body.design === "object" ? body.design : undefined;
    let existing: Record<string, unknown> = {};
    const current = await db.select({ settings: stores.settings, logo: stores.logo }).from(stores).where(eq(stores.id, storeId)).limit(1);
    if (current.length) existing = (current[0].settings ?? {}) as Record<string, unknown>;
    const merged = design ? { ...existing, ...design } : existing;

    await db
      .update(stores)
      .set({
        name,
        email: String(body?.email ?? ""),
        phone: String(body?.phone ?? ""),
        logo: body?.logo !== undefined ? String(body.logo) : (current[0]?.logo ?? ""),
        settings: merged,
      })
      .where(eq(stores.id, storeId));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحفظ" }, { status: 500 });
  }
}
