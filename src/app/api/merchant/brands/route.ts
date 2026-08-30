import { db } from "@/db";
import { brands, products, auditLogs } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

async function merchantStore() {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "غير مصرح" }, { status: 401 }), storeId: "", user: null };
  if (user.role !== "merchant" && user.role !== "admin")
    return { error: Response.json({ error: "صلاحية غير كافية" }, { status: 403 }), storeId: "", user };
  const storeId = user.storeId ?? (await getStoreId());
  if (!storeId) return { error: Response.json({ error: "لا يوجد متجر مرتبط" }, { status: 400 }), storeId: "", user };
  return { error: null, storeId, user };
}

function slugify(n: string) {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export async function GET() {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const rows = await db.select().from(brands).where(eq(brands.storeId, storeId));
  const counts = await db
    .select({ brandId: products.brandId, n: sql<number>`count(*)::int` })
    .from(products)
    .where(and(eq(products.storeId, storeId), sql`${products.brandId} is not null`))
    .groupBy(products.brandId);
  const map = Object.fromEntries(counts.map((c) => [c.brandId, c.n]));
  return Response.json({ brands: rows.map((b) => ({ ...b, productCount: b.id ? (map[b.id] ?? 0) : 0 })) });
}

export async function POST(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    if (name.length < 2) return Response.json({ error: "اسم الماركة مطلوب" }, { status: 400 });
    const slug = slugify(String(body?.slug ?? "")) || slugify(name) + "-" + Date.now().toString(36);
    const clash = await db.select({ id: brands.id }).from(brands).where(and(eq(brands.storeId, storeId), eq(brands.slug, slug))).limit(1);
    if (clash.length) return Response.json({ error: "هذه الماركة موجودة" }, { status: 409 });
    const [row] = await db.insert(brands).values({ storeId, slug, name, logo: String(body?.logo ?? "") }).returning();
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "brand.create", entity: "brand", entityId: row.id, meta: { slug } });
    return Response.json({ ok: true, brand: row });
  } catch (e) {
    console.error("create brand", e);
    return Response.json({ error: "تعذر إنشاء الماركة" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(brands).where(and(eq(brands.id, id), eq(brands.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    await db
      .update(brands)
      .set({
        name: String(body?.name ?? found[0].name).trim() || found[0].name,
        logo: body?.logo !== undefined ? String(body.logo) : found[0].logo,
      })
      .where(eq(brands.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "brand.update", entity: "brand", entityId: id });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحفظ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ?? "";
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(brands).where(and(eq(brands.id, id), eq(brands.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    const used = await db.select({ n: sql<number>`count(*)::int` }).from(products).where(and(eq(products.storeId, storeId), eq(products.brandId, id)));
    if ((used[0]?.n ?? 0) > 0)
      return Response.json({ error: "لا يمكن حذف ماركة مرتبطة بمنتجات — أزل الماركة من المنتجات أولًا" }, { status: 409 });
    await db.delete(brands).where(eq(brands.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "brand.delete", entity: "brand", entityId: id });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
