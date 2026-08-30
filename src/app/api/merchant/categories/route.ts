import { db } from "@/db";
import { categories, products, auditLogs } from "@/db/schema";
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

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function GET() {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const rows = await db.select().from(categories).where(eq(categories.storeId, storeId));
  const counts = await db
    .select({ categorySlug: products.categorySlug, n: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.storeId, storeId))
    .groupBy(products.categorySlug);
  const countMap = Object.fromEntries(counts.map((c) => [c.categorySlug, c.n]));
  return Response.json({ categories: rows.map((c) => ({ ...c, productCount: countMap[c.slug] ?? 0 })) });
}

export async function POST(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    if (name.length < 2) return Response.json({ error: "اسم القسم مطلوب" }, { status: 400 });
    const slug = slugify(String(body?.slug ?? "")) || slugify(name) + "-" + Date.now().toString(36);
    const clash = await db.select({ id: categories.id }).from(categories).where(and(eq(categories.storeId, storeId), eq(categories.slug, slug))).limit(1);
    if (clash.length) return Response.json({ error: "هذا القسم موجود مسبقًا" }, { status: 409 });

    const [row] = await db
      .insert(categories)
      .values({
        storeId,
        slug,
        name,
        tagline: String(body?.tagline ?? ""),
        icon: String(body?.icon ?? "box"),
        tint: String(body?.tint ?? "cyan"),
      })
      .returning();
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "category.create", entity: "category", entityId: row.id, meta: { slug } });
    return Response.json({ ok: true, category: row });
  } catch (e) {
    console.error("create category", e);
    return Response.json({ error: "تعذر إنشاء القسم" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });

    const name = String(body?.name ?? found[0].name).trim();
    if (name.length < 2) return Response.json({ error: "اسم القسم مطلوب" }, { status: 400 });
    await db
      .update(categories)
      .set({
        name,
        tagline: String(body?.tagline ?? found[0].tagline),
        status: String(body?.status ?? found[0].status),
      })
      .where(eq(categories.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "category.update", entity: "category", entityId: id, meta: { name } });
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
    const found = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    const used = await db.select({ n: sql<number>`count(*)::int` }).from(products).where(and(eq(products.storeId, storeId), eq(products.categorySlug, found[0].slug)));
    if ((used[0]?.n ?? 0) > 0)
      return Response.json({ error: "لا يمكن حذف قسم يحتوي منتجات — انقل المنتجات أولًا" }, { status: 409 });
    await db.delete(categories).where(eq(categories.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "category.delete", entity: "category", entityId: id });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
