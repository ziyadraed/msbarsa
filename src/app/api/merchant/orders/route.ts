import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
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

export async function GET(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const conds = [eq(orders.storeId, storeId)];
  if (status && status !== "all") conds.push(eq(orders.status, status));
  if (q) conds.push(and(eq(orders.storeId, storeId))!);

  const rows = await db.select().from(orders).where(and(...conds)!).orderBy(desc(orders.createdAt)).limit(200);

  const withItems = await Promise.all(
    rows.map(async (o) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      return { ...o, items };
    })
  );
  return Response.json({ orders: withItems });
}

export async function PATCH(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const orderId = String(body?.orderId ?? "");
    const status = String(body?.status ?? "");
    const valid = ["paid", "awaiting_payment", "processing", "ready", "shipped", "completed", "cancelled", "refunded"];
    if (!orderId || !valid.includes(status))
      return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
    // scope to store
    const found = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.id, orderId), eq(orders.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر التحديث" }, { status: 500 });
  }
}
