import { db } from "@/db";
import { products, productVariants, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

export async function GET(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") ?? "";
  const rows = await db
    .select({
      id: productVariants.id,
      name: productVariants.name,
      sku: productVariants.sku,
      price: productVariants.price,
      cost: productVariants.cost,
      stock: productVariants.stock,
      options: productVariants.options,
      productId: productVariants.productId,
    })
    .from(productVariants)
    .where(and(eq(productVariants.storeId, storeId), eq(productVariants.productId, productId)));
  return Response.json({ variants: rows });
}

export async function POST(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const productId = String(body?.productId ?? "");
    const name = String(body?.name ?? "").trim();
    const price = Number(body?.price ?? 0);
    if (!productId) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    if (!name) return Response.json({ error: "اسم المتغير مطلوب" }, { status: 400 });
    if (!price || price <= 0) return Response.json({ error: "سعر غير صالح" }, { status: 400 });
    const product = await db.select({ id: products.id }).from(products).where(and(eq(products.id, productId), eq(products.storeId, storeId))).limit(1);
    if (!product.length) return Response.json({ error: "منتج غير موجود" }, { status: 404 });

    const [row] = await db.insert(productVariants).values({
      storeId,
      productId,
      name,
      sku: String(body?.sku ?? ""),
      price: Math.round(price),
      cost: Math.round(Number(body?.cost ?? 0)),
      stock: Math.round(Number(body?.stock ?? 0)),
      options: body?.options && typeof body.options === "object" ? body.options : {},
    }).returning();
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "variant.create", entity: "variant", entityId: row.id, meta: { productId, name } });
    return Response.json({ ok: true, variant: row });
  } catch {
    return Response.json({ error: "تعذر إضافة المتغير" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(productVariants).where(and(eq(productVariants.id, id), eq(productVariants.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    await db.update(productVariants).set({
      name: String(body?.name ?? found[0].name),
      sku: String(body?.sku ?? found[0].sku),
      price: body?.price !== undefined ? Math.round(Number(body.price)) : found[0].price,
      cost: body?.cost !== undefined ? Math.round(Number(body.cost)) : found[0].cost,
      stock: body?.stock !== undefined ? Math.round(Number(body.stock)) : found[0].stock,
    }).where(eq(productVariants.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "variant.update", entity: "variant", entityId: id });
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
    const found = await db.select().from(productVariants).where(and(eq(productVariants.id, id), eq(productVariants.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    await db.delete(productVariants).where(eq(productVariants.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "variant.delete", entity: "variant", entityId: id });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
