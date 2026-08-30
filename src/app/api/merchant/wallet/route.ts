import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
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

  const [totalAgg] = await db
    .select({ received: sql<number>`coalesce(sum(total) filter (where status not in ('cancelled','refunded')),0)::int` })
    .from(orders)
    .where(eq(orders.storeId, storeId));
  const [refundedAgg] = await db
    .select({ refunded: sql<number>`coalesce(sum(total) filter (where status='refunded'),0)::int` })
    .from(orders)
    .where(eq(orders.storeId, storeId));
  const [countAgg] = await db
    .select({ paid: sql<number>`count(*) filter (where status='paid')::int`, pending: sql<number>`count(*) filter (where payment_status='pending')::int` })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  const byPayment = await db
    .select({ method: orders.paymentMethod, total: sql<number>`coalesce(sum(total),0)::int` })
    .from(orders)
    .where(and(eq(orders.storeId, storeId), sql`status not in ('cancelled','refunded')`))
    .groupBy(orders.paymentMethod);

  return Response.json({
    received: totalAgg?.received ?? 0,
    refunded: refundedAgg?.refunded ?? 0,
    paidOrders: countAgg?.paid ?? 0,
    pendingOrders: countAgg?.pending ?? 0,
    byPayment,
  });
}
