import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

// Resolve the merchant's store from the session.
async function requireMerchantStore(): Promise<{ error: Response | null; storeId: string }> {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "غير مصرح" }, { status: 401 }), storeId: "" };
  if (user.role !== "merchant" && user.role !== "admin") {
    return { error: Response.json({ error: "صلاحية غير كافية" }, { status: 403 }), storeId: "" };
  }
  const storeId = user.storeId ?? (await getStoreId());
  if (!storeId) return { error: Response.json({ error: "لا يوجد متجر مرتبط" }, { status: 400 }), storeId: "" };
  return { error: null, storeId };
}

export async function GET(req: Request) {
  const { error, storeId } = await requireMerchantStore();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt));
  const cats = await db.select().from(categories).where(eq(categories.storeId, storeId));
  return Response.json({ products: rows, categories: cats });
}

export async function POST(req: Request) {
  const { error, storeId } = await requireMerchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const price = Number(body?.price ?? 0);
    const categorySlug = String(body?.categorySlug ?? "windows").trim();
    const stock = Number(body?.stock ?? 0);
    if (name.length < 2) return Response.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
    if (!price || price <= 0) return Response.json({ error: "سعر غير صالح" }, { status: 400 });

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)}-${Date.now().toString(36)}`;

    const [row] = await db
      .insert(products)
      .values({
        storeId,
        slug,
        categorySlug,
        name,
        latinName: String(body?.latinName ?? ""),
        shortDesc: String(body?.shortDesc ?? ""),
        longDesc: String(body?.longDesc ?? ""),
        price: Math.round(price),
        comparePrice: body?.comparePrice ? Math.round(Number(body.comparePrice)) : null,
        stock: Math.round(stock),
        type: String(body?.type ?? "physical"),
        licenseType: String(body?.licenseType ?? "Retail"),
        devices: String(body?.devices ?? "جهاز واحد"),
        duration: String(body?.duration ?? "مدى الحياة"),
        status: "active",
        images: [],
        features: [],
      })
      .returning();
    return Response.json({ ok: true, product: row });
  } catch (e) {
    console.error("create product", e);
    return Response.json({ error: "تعذر إنشاء المنتج" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error, storeId } = await requireMerchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(products).where(and(eq(products.id, id), eq(products.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "منتج غير موجود" }, { status: 404 });

    const name = String(body?.name ?? found[0].name).trim();
    if (name.length < 2) return Response.json({ error: "اسم المنتج مطلوب" }, { status: 400 });

    await db
      .update(products)
      .set({
        name,
        latinName: String(body?.latinName ?? found[0].latinName),
        categorySlug: String(body?.categorySlug ?? found[0].categorySlug),
        price: body?.price !== undefined ? Math.round(Number(body.price)) : found[0].price,
        comparePrice: body?.comparePrice !== undefined ? Math.round(Number(body.comparePrice)) || null : found[0].comparePrice,
        shortDesc: String(body?.shortDesc ?? found[0].shortDesc),
        longDesc: String(body?.longDesc ?? found[0].longDesc),
        sku: String(body?.sku ?? found[0].sku),
        barcode: String(body?.barcode ?? found[0].barcode),
        stock: body?.stock !== undefined ? Math.round(Number(body.stock) || 0) : found[0].stock,
        status: String(body?.status ?? found[0].status),
        type: String(body?.type ?? found[0].type),
        cost: body?.cost !== undefined ? Math.round(Number(body.cost) || 0) : found[0].cost,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    return Response.json({ ok: true });
  } catch (e) {
    console.error("update product", e);
    return Response.json({ error: "تعذر الحفظ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error, storeId } = await requireMerchantStore();
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ?? "";
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select({ id: products.id }).from(products).where(and(eq(products.id, id), eq(products.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "منتج غير موجود" }, { status: 404 });
    await db.delete(products).where(eq(products.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
