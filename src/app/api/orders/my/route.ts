import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "غير مصرح" }, { status: 401 });
  try {
    const myOrders = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
    if (!myOrders.length) return Response.json({ orders: [] });
    const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, myOrders.map((o) => o.id)));
    const byOrder = new Map<string, typeof items>();
    for (const it of items) {
      const arr = byOrder.get(it.orderId) ?? [];
      arr.push(it);
      byOrder.set(it.orderId, arr);
    }
    return Response.json({
      orders: myOrders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
        items: (byOrder.get(o.id) ?? []).map((it) => ({
          productName: it.productName,
          productSlug: it.productSlug,
          price: it.price,
          licenseKey: it.licenseKey,
        })),
      })),
    });
  } catch (e) {
    console.error("my orders error", e);
    return Response.json({ error: "تعذر جلب الطلبات" }, { status: 500 });
  }
}
