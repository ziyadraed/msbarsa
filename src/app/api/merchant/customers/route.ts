import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
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

export async function GET(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const conds = [eq(customers.storeId, storeId)];
  if (q) {
    const p = `%${q}%`;
    conds.push(or(like(customers.name, p), like(customers.email, p), like(customers.phone, p))!);
  }
  const rows = await db.select().from(customers).where(and(...conds)!).orderBy(desc(customers.totalSpent)).limit(200);
  return Response.json({ customers: rows });
}

export async function PATCH(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "عميل غير موجود" }, { status: 404 });
    const tags = Array.isArray(body?.tags)
      ? (body.tags as string[]).map((t) => String(t).trim()).filter(Boolean).slice(0, 10)
      : found[0].tags;
    const notes = body?.notes !== undefined ? String(body.notes) : found[0].notes;
    await db.update(customers).set({ tags, notes }).where(eq(customers.id, id));
    return Response.json({ ok: true, tags, notes });
  } catch {
    return Response.json({ error: "تعذر الحفظ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ?? "";
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select({ id: customers.id }).from(customers).where(and(eq(customers.id, id), eq(customers.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "عميل غير موجود" }, { status: 404 });
    await db.delete(customers).where(eq(customers.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
