import { db } from "@/db";
import { orders, orderItems, products, customers } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
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

  const [revAgg] = await db
    .select({ revenue: sql<number>`coalesce(sum(total),0)::int`, orders: sql<number>`count(*)::int`, aov: sql<number>`coalesce(round(avg(total)),0)::int` })
    .from(orders).where(eq(orders.storeId, storeId));
  const [custAgg] = await db.select({ n: sql<number>`count(*)::int` }).from(customers).where(eq(customers.storeId, storeId));
  const [prodAgg] = await db.select({ n: sql<number>`count(*)::int` }).from(products).where(eq(products.storeId, storeId));

  const topProducts = await db
    .select({ name: orderItems.productName, qty: sql<number>`sum(qty)::int`, revenue: sql<number>`sum(price*qty)::int` })
    .from(orderItems).where(eq(orderItems.storeId, storeId)).groupBy(orderItems.productName)
    .orderBy(desc(sql`sum(price*qty)`)).limit(6);

  const byStatus = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders).where(eq(orders.storeId, storeId)).groupBy(orders.status);

  const byCategory = await db
    .select({ category: orderItems.categorySlug, revenue: sql<number>`sum(price*qty)::int`, qty: sql<number>`sum(qty)::int` })
    .from(orderItems).where(eq(orderItems.storeId, storeId)).groupBy(orderItems.categorySlug)
    .orderBy(desc(sql`sum(price*qty)`)).limit(6);

  return Response.json({
    summary: { revenue: revAgg?.revenue ?? 0, orders: revAgg?.orders ?? 0, aov: revAgg?.aov ?? 0, customers: custAgg?.n ?? 0, products: prodAgg?.n ?? 0 },
    topProducts,
    byStatus,
    byCategory,
  });
}
