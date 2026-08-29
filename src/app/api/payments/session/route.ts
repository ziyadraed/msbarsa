import { db } from "@/db";
import { orders } from "@/db/schema";
import { priceMap } from "@/lib/data";
import { generateOrderNumber, validEmail } from "@/lib/utils";
import { gatewayConfig, toHalalas } from "@/lib/payments";
import { getSessionUser } from "@/lib/auth";
import type { PendingLine } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Creates a pending order before the customer pays through Moyasar's hosted form.
 * Prices are resolved server-side — the client only sends slugs and quantities.
 */
export async function POST(req: Request) {
  try {
    const cfg = gatewayConfig();
    if (!cfg.enabled) {
      return Response.json({ error: "بوابة الدفع غير مفعّلة حاليًا" }, { status: 400 });
    }

    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();
    const items: { slug: string; qty: number }[] = Array.isArray(body?.items) ? body.items : [];

    if (name.length < 2) return Response.json({ error: "الرجاء إدخال الاسم الكامل" }, { status: 400 });
    if (!validEmail(email)) return Response.json({ error: "الرجاء إدخال بريد إلكتروني صحيح" }, { status: 400 });
    if (items.length === 0 || items.length > 30) return Response.json({ error: "السلة فارغة" }, { status: 400 });

    const prices = await priceMap();
    const lines: PendingLine[] = [];
    for (const raw of items) {
      const p = prices[String(raw?.slug ?? "")];
      if (!p) return Response.json({ error: "منتج غير معروف في السلة" }, { status: 400 });
      const qty = Math.max(1, Math.min(10, Number(raw?.qty) || 1));
      lines.push({ slug: p.slug, name: p.name, categorySlug: p.categorySlug, price: p.price, qty });
    }
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    if (subtotal < 1) return Response.json({ error: "مبلغ الطلب غير صالح" }, { status: 400 });

    const user = await getSessionUser();
    const orderNumber = generateOrderNumber();
    await db.insert(orders).values({
      orderNumber,
      userId: user?.id ?? null,
      customerName: name,
      email,
      phone,
      paymentMethod: "moyasar",
      paymentProvider: "moyasar",
      subtotal,
      discount: 0,
      total: subtotal,
      status: "awaiting_payment",
      cartSnapshot: lines,
    });

    return Response.json({
      ok: true,
      orderNumber,
      amount: toHalalas(subtotal),
      currency: cfg.currency,
      description: `MESBAR Order ${orderNumber}`,
    });
  } catch (e) {
    console.error("payment session error", e);
    return Response.json({ error: "تعذر بدء عملية الدفع" }, { status: 500 });
  }
}
