import { db } from "@/db";
import { customers, orders, orderItems } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const { id } = await params;
  const cust = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.storeId, storeId)))
    .limit(1);
  if (!cust.length) return Response.json({ error: "عميل غير موجود" }, { status: 404 });

  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.storeId, storeId), eq(orders.email, cust[0].email)))
    .orderBy(desc(orders.createdAt))
    .limit(50);
  const withItems = await Promise.all(
    rows.map(async (o) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      return { ...o, items };
    })
  );
  return Response.json({ customer: cust[0], orders: withItems });
}
