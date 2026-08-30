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

// Create a manual order (e.g. phone/offline sale) — a key Salla-style feature.
export async function POST(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const customerName = String(body?.customerName ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();
    const raw = Array.isArray(body?.items) ? body.items : Array.isArray(body?.lines) ? body.lines : [];
    const lines: { slug: string; name: string; categorySlug: string; price: number; qty: number }[] = raw.map(
      (l: { slug?: string; name?: string; categorySlug?: string; price?: number; qty?: number }) => ({
        slug: String(l?.slug ?? ""),
        name: String(l?.name ?? ""),
        categorySlug: String(l?.categorySlug ?? "windows"),
        price: Number(l?.price ?? 0),
        qty: Number(l?.qty ?? 1),
      })
    );

    if (customerName.length < 2) return Response.json({ error: "اسم العميل مطلوب" }, { status: 400 });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      return Response.json({ error: "بريد إلكتروني غير صالح" }, { status: 400 });
    if (!lines.length) return Response.json({ error: "أضف منتجًا واحدًا على الأقل" }, { status: 400 });

    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const orderNumber = `MB-${Math.floor(100000 + Math.random() * 900000)}`;

    const [order] = await db
      .insert(orders)
      .values({
        storeId,
        orderNumber,
        customerName,
        email,
        phone,
        paymentMethod: "manual",
        paymentProvider: "manual",
        subtotal,
        discount: 0,
        total: subtotal,
        status: "paid",
      })
      .returning();

    for (const line of lines) {
      await db.insert(orderItems).values({
        storeId,
        orderId: order.id,
        productSlug: line.slug,
        productName: line.name,
        categorySlug: line.categorySlug,
        price: line.price,
        qty: line.qty,
        licenseKey: `MANUAL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      });
    }

    return Response.json({ ok: true, order });
  } catch {
    return Response.json({ error: "تعذر إنشاء الطلب" }, { status: 500 });
  }
}
