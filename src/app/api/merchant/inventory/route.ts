import { db } from "@/db";
import { products, auditLogs } from "@/db/schema";
import { eq, desc, and, asc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 10;

async function merchantStore() {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "غير مصرح" }, { status: 401 }), storeId: "" };
  if (user.role !== "merchant" && user.role !== "admin")
    return { error: Response.json({ error: "صلاحية غير كافية" }, { status: 403 }), storeId: "" };
  const storeId = user.storeId ?? (await getStoreId());
  if (!storeId) return { error: Response.json({ error: "لا يوجد متجر مرتبط" }, { status: 400 }), storeId: "" };
  return { error: null, storeId, user };
}

export async function GET(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const onlyLow = searchParams.get("low") === "1";
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      latinName: products.latinName,
      slug: products.slug,
      sku: products.sku,
      stock: products.stock,
      status: products.status,
      price: products.price,
      cost: products.cost,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), onlyLow ? sql`${products.stock} <= ${LOW_STOCK_THRESHOLD}` : undefined))
    .orderBy(asc(products.name));
  const lowCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(products)
    .where(and(eq(products.storeId, storeId), sql`${products.stock} <= ${LOW_STOCK_THRESHOLD}`));
  return Response.json({
    products: rows,
    lowCount: lowCount[0]?.n ?? 0,
    threshold: LOW_STOCK_THRESHOLD,
  });
}

// Adjust stock: { id, delta } (positive adds, negative removes) or { id, set }
export async function PATCH(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    const delta = Number(body?.delta ?? 0);
    const set = body?.set !== undefined ? Number(body.set) : null;
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });

    const found = await db.select().from(products).where(and(eq(products.id, id), eq(products.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "منتج غير موجود" }, { status: 404 });
    const current = found[0].stock;
    const next = set !== null ? Math.max(0, Math.round(set)) : Math.max(0, current + Math.round(delta));
    if (next === current) return Response.json({ ok: true, product: { ...found[0], stock: next } });

    await db
      .update(products)
      .set({ stock: next, updatedAt: new Date() })
      .where(eq(products.id, id));

    await db.insert(auditLogs).values({
      storeId,
      userId: user?.id,
      action: set !== null ? "inventory.set" : "inventory.adjust",
      entity: "product",
      entityId: id,
      meta: { before: current, after: next, delta: next - current },
    });

    return Response.json({ ok: true, product: { ...found[0], stock: next } });
  } catch (e) {
    console.error("inventory adjust", e);
    return Response.json({ error: "تعذر تعديل المخزون" }, { status: 500 });
  }
}
