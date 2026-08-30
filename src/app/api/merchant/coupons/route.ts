import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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
  const rows = await db.select().from(coupons).where(eq(coupons.storeId, storeId)).orderBy(desc(coupons.createdAt));
  return Response.json({ coupons: rows });
}

export async function POST(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const code = String(body?.code ?? "").trim().toUpperCase().replace(/\s+/g, "");
    const type = String(body?.type ?? "percent");
    const value = Number(body?.value ?? 0);
    const minOrder = Number(body?.minOrder ?? 0);
    if (!code || code.length < 3) return Response.json({ error: "أدخل كود صحيح (3 أحرف فأكثر)" }, { status: 400 });
    if (value <= 0) return Response.json({ error: "قيمة الخصم غير صالحة" }, { status: 400 });
    if (type === "percent" && value > 100) return Response.json({ error: "النسبة القصوى 100%" }, { status: 400 });

    const clash = await db.select({ id: coupons.id }).from(coupons).where(and(eq(coupons.storeId, storeId), eq(coupons.code, code))).limit(1);
    if (clash.length) return Response.json({ error: "كود الكوبون مستخدم مسبقًا" }, { status: 409 });

    const [row] = await db.insert(coupons).values({
      storeId,
      code,
      type,
      value: Math.round(value),
      minOrder: Math.round(minOrder),
      maxUses: body?.maxUses ? Math.round(Number(body.maxUses)) : null,
      active: body?.active !== false,
    }).returning();
    return Response.json({ ok: true, coupon: row });
  } catch {
    return Response.json({ error: "تعذر إنشاء الكوبون" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ?? "";
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select({ id: coupons.id }).from(coupons).where(and(eq(coupons.id, id), eq(coupons.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    await db.delete(coupons).where(eq(coupons.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
