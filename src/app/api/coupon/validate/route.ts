import { db } from "@/db";
import { coupons } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getStoreId } from "@/lib/tenant";
import { priceMap } from "@/lib/data";

export const dynamic = "force-dynamic";

// Validates a coupon code against the current cart and returns the discount
// to apply (server-authoritative). Does NOT create an order.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body?.code ?? "").trim().toUpperCase().replace(/\s+/g, "");
    const items = Array.isArray(body?.items) ? body.items : [];
    if (!code) return Response.json({ error: "أدخل كود الخصم" }, { status: 400 });

    const storeId = await getStoreId();
    const rows = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.storeId, storeId), eq(coupons.code, code)))
      .limit(1);
    const c = rows[0];
    if (!c || c.active === false) return Response.json({ error: "كود الخصم غير صالح" }, { status: 400 });

    const now = new Date();
    if ((c.startsAt && c.startsAt > now) || (c.endsAt && c.endsAt < now))
      return Response.json({ error: "كود الخصم غير صالح في هذا الوقت" }, { status: 400 });
    if (c.maxUses && (c.used ?? 0) >= c.maxUses)
      return Response.json({ error: "تم استنفاد كود الخصم" }, { status: 400 });

    // Compute cart subtotal server-side.
    const prices = await priceMap();
    let subtotal = 0;
    for (const raw of items) {
      const p = prices[String(raw?.slug ?? "")];
      if (!p) return Response.json({ error: "منتج غير معروف" }, { status: 400 });
      const qty = Math.max(1, Math.min(10, Number(raw?.qty) || 1));
      subtotal += p.price * qty;
    }
    if (subtotal < (c.minOrder ?? 0))
      return Response.json({ error: `كود الخصم يتطلب حدًا أدنى ${c.minOrder} ر.س` }, { status: 400 });

    let discount = 0;
    if (c.type === "percent") discount = Math.round((subtotal * c.value) / 100);
    else if (c.type === "fixed") discount = Math.min(c.value, subtotal);

    return Response.json({ ok: true, code: c.code, type: c.type, value: c.value, discount, total: Math.max(0, subtotal - discount) });
  } catch {
    return Response.json({ error: "تعذر التحقق من الكوبون" }, { status: 500 });
  }
}
