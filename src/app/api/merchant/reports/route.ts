import { db } from "@/db";
import { orders, orderItems, products, customers } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

async function merchantStore() {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "غير مصرح" }, { status: 401 }), storeId: "" };
  if (user.role !== "merchant" && user.role !== "admin")
    return { error: Response.json({ error: "صلاحية غير كافية" }, { status: 403 }), storeId: "" };
  const storeId = user.storeId ?? (await getStoreId());
  if (!storeId) return { error: Response.json({ error: "لا يوجد متجر" }, { status: 400 }), storeId: "" };
  return { error: null, storeId };
}

export async function GET(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const type = new URL(req.url).searchParams.get("type") || "summary";
  const active = sql`status not in ('cancelled','refunded')`;

  // ---- SUMMARY ----
  if (type === "summary") {
    const [rev] = await db.select({ total: sql<number>`coalesce(sum(total),0)::int` }).from(orders).where(and(eq(orders.storeId, storeId), active));
    const [count] = await db.select({ n: sql<number>`count(*)::int` }).from(orders).where(and(eq(orders.storeId, storeId), active));
    const [ordersCount] = await db.select({ n: sql<number>`count(*)::int` }).from(orders).where(eq(orders.storeId, storeId));
    const [cust] = await db.select({ n: sql<number>`count(*)::int` }).from(customers).where(eq(customers.storeId, storeId));
    const [prod] = await db.select({ n: sql<number>`count(*)::int` }).from(products).where(eq(products.storeId, storeId));
    const [aov] = await db.select({ v: sql<number>`round(coalesce(sum(total),0)::numeric/count(*),2)::float` }).from(orders).where(and(eq(orders.storeId, storeId), active));
    // sales by day (last 14 days)
    const byDay = await db.select({ d: sql<string>`to_char(created_at,'MM-DD')`, total: sql<number>`coalesce(sum(total),0)::int` })
      .from(orders).where(and(eq(orders.storeId, storeId), active, sql`created_at > now() - interval '14 days'`)).groupBy(sql`to_char(created_at,'MM-DD')`).orderBy(sql`to_char(created_at,'MM-DD')`);
    return Response.json({ revenue: rev?.total ?? 0, orders: count?.n ?? 0, customers: cust?.n ?? 0, products: prod?.n ?? 0, aov: aov?.v ?? 0, byDay });
  }

  // ---- SALES ----
  if (type === "sales") {
    const byPayment = await db.select({ key: orders.paymentMethod, total: sql<number>`coalesce(sum(total),0)::int`, n: sql<number>`count(*)::int` })
      .from(orders).where(and(eq(orders.storeId, storeId), active)).groupBy(orders.paymentMethod).orderBy(sql`coalesce(sum(total),0) desc`);
    const byStatus = await db.select({ key: orders.status, total: sql<number>`coalesce(sum(total),0)::int`, n: sql<number>`count(*)::int` })
      .from(orders).where(eq(orders.storeId, storeId)).groupBy(orders.status);
    return Response.json({ byPayment, byStatus });
  }

  // ---- PRODUCTS ----
  if (type === "products") {
    const top = await db.select({
      name: orderItems.productName, category: orderItems.categorySlug,
      qty: sql<number>`sum(qty)::int`, revenue: sql<number>`sum(qty*price)::int`,
    }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.storeId, storeId), active)).groupBy(orderItems.productName, orderItems.categorySlug)
      .orderBy(desc(sql`sum(qty*price)`)).limit(10);
    return Response.json({ top });
  }

  // ---- INVENTORY ----
  if (type === "inventory") {
    const low = await db.select({ name: products.name, stock: products.stock }).from(products)
      .where(eq(products.storeId, storeId)).orderBy(sql`stock asc`).limit(15);
    return Response.json({ low });
  }

  // ---- CUSTOMERS ----
  if (type === "customers") {
    const top = await db.select({ name: customers.name, email: customers.email, totalSpent: customers.totalSpent, orders: customers.orderCount })
      .from(customers).where(eq(customers.storeId, storeId)).orderBy(desc(sql`coalesce(total_spent,0)`)).limit(10);
    const [repeat] = await db.select({ n: sql<number>`count(*)::int` }).from(customers).where(and(eq(customers.storeId, storeId), sql`orders_count > 1`));
    return Response.json({ top, repeat: repeat?.n ?? 0 });
  }

  // ---- GEO ----
  if (type === "geo") {
    const byRegion = await db.select({ region: sql<string>`coalesce(address->>'city','غير محدد')`, n: sql<number>`count(*)::int` })
      .from(orders).where(eq(orders.storeId, storeId)).groupBy(sql`address->>'city'`).orderBy(desc(sql`count(*)`));
    return Response.json({ byRegion });
  }

  // ---- PAYMENTS ----
  if (type === "payments") {
    const byMethod = await db.select({ key: orders.paymentMethod, total: sql<number>`coalesce(sum(total),0)::int`, n: sql<number>`count(*)::int` })
      .from(orders).where(and(eq(orders.storeId, storeId), active)).groupBy(orders.paymentMethod);
    return Response.json({ byMethod });
  }

  // ---- SHIPPING ----
  if (type === "shipping") {
    const byMethod = await db.select({ key: orders.shippingMethod, total: sql<number>`coalesce(sum(shipping_cost),0)::int`, n: sql<number>`count(*)::int` })
      .from(orders).where(and(eq(orders.storeId, storeId), active)).groupBy(orders.shippingMethod);
    return Response.json({ byMethod });
  }

  // ---- CONVERSION / visits (derive from orders by date) ----
  if (type === "conversion") {
    const [paid] = await db.select({ n: sql<number>`count(*)::int` }).from(orders).where(and(eq(orders.storeId, storeId), active));
    const [total] = await db.select({ n: sql<number>`count(*)::int` }).from(orders).where(eq(orders.storeId, storeId));
    const rate = total?.n ? Math.round((paid!.n / total!.n) * 1000) / 10 : 0;
    return Response.json({ paid: paid?.n ?? 0, total: total?.n ?? 0, rate });
  }

  // ---- PREFERENCES (category preferences from sold items) ----
  if (type === "preferences") {
    const cats = await db.select({ key: orderItems.categorySlug, n: sql<number>`sum(qty)::int` })
      .from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.storeId, storeId), active)).groupBy(orderItems.categorySlug).orderBy(desc(sql`sum(qty)`)).limit(8);
    const total = cats.reduce((s, c) => s + c.n, 0);
    return Response.json({ cats, total });
  }

  // ---- BEHAVIOR (repeat buyers, avg order value) ----
  if (type === "behavior") {
    const per = await db.select({ name: orders.customerName, n: sql<number>`count(*)::int`, total: sql<number>`sum(total)::int` })
      .from(orders).where(and(eq(orders.storeId, storeId), active)).groupBy(orders.customerName).having(sql`count(*) > 1`).orderBy(desc(sql`count(*)`)).limit(10);
    return Response.json({ repeat: per });
  }

  // ---- ABANDONED CARTS (pending/unpaid orders as proxy) ----
  if (type === "abandoned") {
    const items = await db.select({ id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, total: orders.total, createdAt: orders.createdAt })
      .from(orders).where(and(eq(orders.storeId, storeId), sql`status in ('pending','unpaid')`)).orderBy(desc(orders.createdAt)).limit(20);
    const [count] = await db.select({ n: sql<number>`count(*)::int` }).from(orders).where(and(eq(orders.storeId, storeId), sql`status in ('pending','unpaid')`));
    return Response.json({ items, count: count?.n ?? 0 });
  }

  return Response.json({ ok: true });
}
