import { db } from "@/db";
import { orders, orderItems, products, customers, stores } from "@/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

/** Aggregate store KPIs for a merchant dashboard — all scoped by storeId. */
export async function getStoreStats(storeId: string) {
  const [orderAgg] = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(total),0)::int`,
      paidCount: sql<number>`count(*) filter (where status='paid')::int`,
    })
    .from(orders)
    .where(eq(orders.storeId, storeId));
  const [custAgg] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customers)
    .where(eq(customers.storeId, storeId));
  const [prodAgg] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.status, "active")));
  const lowStock = await db
    .select({ id: products.id, name: products.name, stock: products.stock, sku: products.sku })
    .from(products)
    .where(and(eq(products.storeId, storeId), sql`${products.stock} <= 10`))
    .limit(10);

  const orderCount = orderAgg?.count ?? 0;
  const revenue = orderAgg?.revenue ?? 0;
  return {
    orderCount,
    revenue,
    aov: orderCount ? Math.round(revenue / orderCount) : 0,
    customerCount: custAgg?.count ?? 0,
    productCount: prodAgg?.count ?? 0,
    lowStock,
  };
}

/** Latest N orders for the store. */
export async function getLatestOrders(storeId: string, limit = 6) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  return rows;
}

/** Best sellers by revenue (item price * qty) for the store. */
export async function getBestSellers(storeId: string, limit = 5) {
  const rows = await db
    .select({
      name: orderItems.productName,
      qty: sql<number>`sum(qty)::int`,
      revenue: sql<number>`sum(price * qty)::int`,
    })
    .from(orderItems)
    .where(eq(orderItems.storeId, storeId))
    .groupBy(orderItems.productName)
    .orderBy(desc(sql`sum(price * qty)`))
    .limit(limit);
  return rows;
}

/** Orders broken down by status for the store. */
export async function getOrdersByStatus(storeId: string) {
  const rows = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .groupBy(orders.status);
  return rows;
}
