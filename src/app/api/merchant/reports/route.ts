import { db } from "@/db";
import { orders, orderItems, customers } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
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
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 30), 1), 90);

  // Revenue + orders grouped by day.
  const byDay = await db
    .select({
      day: sql<string>`to_char(created_at, 'YYYY-MM-DD')`,
      revenue: sql<number>`sum(total)::int`,
      orders: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(and(eq(orders.storeId, storeId), sql`created_at >= now() - make_interval(days => ${days})`))
    .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
    .orderBy(desc(sql`to_char(created_at, 'YYYY-MM-DD')`));

  // Payment methods.
  const byPayment = await db
    .select({ method: orders.paymentMethod, n: sql<number>`count(*)::int`, total: sql<number>`sum(total)::int` })
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .groupBy(orders.paymentMethod);

  // Top customers by spend (from orders).
  const topCustomers = await db
    .select({ email: orders.email, name: orders.customerName, spent: sql<number>`sum(total)::int`, orders: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .groupBy(orders.email, orders.customerName)
    .orderBy(desc(sql`sum(total)`))
    .limit(10);

  // Category performance.
  const byCategory = await db
    .select({ category: orderItems.categorySlug, qty: sql<number>`sum(qty)::int`, revenue: sql<number>`sum(price*qty)::int` })
    .from(orderItems)
    .where(eq(orderItems.storeId, storeId))
    .groupBy(orderItems.categorySlug)
    .orderBy(desc(sql`sum(price*qty)`));

  return Response.json({ days, byDay, byPayment, topCustomers, byCategory });
}
