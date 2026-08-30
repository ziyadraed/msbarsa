import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
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
  const q = searchParams.get("q") ?? undefined;

  const conds = [eq(orderItems.storeId, storeId)];
  if (q) conds.push(or(like(orderItems.licenseKey, `%${q}%`), like(orderItems.productName, `%${q}%`))!);

  const items = await db
    .select({
      id: orderItems.id,
      productName: orderItems.productName,
      licenseKey: orderItems.licenseKey,
      orderId: orderItems.orderId,
      price: orderItems.price,
      qty: orderItems.qty,
    })
    .from(orderItems)
    .where(and(...conds))
    .orderBy(desc(orderItems.id))
    .limit(500);

  const withOrder = await Promise.all(
    items.map(async (it) => {
      const o = await db.select({ orderNumber: orders.orderNumber, email: orders.email, createdAt: orders.createdAt }).from(orders).where(eq(orders.id, it.orderId)).limit(1);
      return { ...it, order: o[0] ?? null };
    })
  );

  return Response.json({ cards: withOrder });
}
