import { db } from "@/db";
import { coupons, orders, orderItems, products } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { priceMap } from "@/lib/data";
import { generateLicenseKey, generateOrderNumber, validEmail } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

type CartLine = { slug: string; qty: number };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();
    const paymentMethod = ["card", "mada", "applepay"].includes(body?.paymentMethod) ? body.paymentMethod : "card";
    const couponCode = String(body?.coupon ?? "").trim().toUpperCase().replace(/\s+/g, "");
    const items: CartLine[] = Array.isArray(body?.items) ? body.items : [];

    if (!name || name.length < 2) {
      return Response.json({ error: "الرجاء إدخال الاسم الكامل" }, { status: 400 });
    }
    if (!validEmail(email)) {
      return Response.json({ error: "الرجاء إدخال بريد إلكتروني صحيح — سيتم إرسال الأكواد إليه" }, { status: 400 });
    }
    if (items.length === 0) {
      return Response.json({ error: "السلة فارغة" }, { status: 400 });
    }
    if (items.length > 30) {
      return Response.json({ error: "عدد العناصر كبير جدًا" }, { status: 400 });
    }

    // Authoritative pricing resolved on the server — client prices are never trusted.
    const prices = await priceMap();
    const lines: { slug: string; name: string; categorySlug: string; price: number; qty: number }[] = [];
    for (const raw of items) {
      const p = prices[String(raw?.slug ?? "")];
      if (!p) return Response.json({ error: "منتج غير معروف في السلة" }, { status: 400 });
      const qty = Math.max(1, Math.min(10, Number(raw?.qty) || 1));
      lines.push({ slug: p.slug, name: p.name, categorySlug: p.categorySlug, price: p.price, qty });
    }

    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

    const storeId = await getStoreId();

    // Server-side stock guard — never let a customer buy an out-of-stock item.
    if (storeId) {
      const slugs = lines.map((l) => l.slug);
      const stockRows = await db
        .select({ slug: products.slug, stock: products.stock })
        .from(products)
        .where(and(eq(products.storeId, storeId), inArray(products.slug, slugs)));
      const stockMap = Object.fromEntries(stockRows.map((r) => [r.slug, r.stock]));
      for (const line of lines) {
        const available = stockMap[line.slug] ?? 0;
        if (available <= 0) {
          return Response.json({ error: `"${line.name}" نفد المخزون — لا يمكن شراؤه حاليًا.` }, { status: 400 });
        }
        if (line.qty > available) {
          return Response.json({ error: `الكمية المطلوبة من "${line.name}" تتجاوز المتوفر (${available})` }, { status: 400 });
        }
      }
    }

    const now = new Date();

    // Coupon resolution (percent / fixed / free_shipping), validated server-side.
    let discount = 0;
    let appliedCoupon = "";
    if (couponCode) {
      const rows = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.storeId, storeId), eq(coupons.code, couponCode)))
        .limit(1);
      const c = rows[0];
      const stillActive = c && c.active !== false;
      const withinWindow = !c ||
        ((c.startsAt ? c.startsAt <= now : true) && (c.endsAt ? c.endsAt >= now : true));
      const withinUses = !c?.maxUses || (c.used ?? 0) < c.maxUses;
      if (!c || !stillActive || !withinWindow || !withinUses) {
        return Response.json({ error: "كود الخصم غير صالح أو منتهي" }, { status: 400 });
      }
      if (subtotal < (c.minOrder ?? 0)) {
        return Response.json({ error: `كود الخصم يتطلب حدًا أدنى للطلب ${c.minOrder} ر.س` }, { status: 400 });
      }
      if (c.type === "percent") {
        discount = Math.round((subtotal * c.value) / 100);
      } else if (c.type === "fixed") {
        discount = Math.min(c.value, subtotal);
      } else if (c.type === "free_shipping") {
        discount = 0; // shipping handled elsewhere; keeps the coupon valid
      }
      appliedCoupon = c.code;
    }

    const total = Math.max(0, subtotal - discount);

    const user = await getSessionUser();
    const orderNumber = generateOrderNumber();

    const [order] = await db
      .insert(orders)
      .values({
        storeId,
        orderNumber,
        userId: user?.id ?? null,
        customerName: name,
        email,
        phone,
        paymentMethod,
        subtotal,
        discount,
        total,
        status: "paid",
        couponCode: appliedCoupon || null,
      })
      .returning({ id: orders.id });

    // Increment coupon usage counter atomically.
    if (appliedCoupon) {
      await db
        .update(coupons)
        .set({ used: sql`${coupons.used} + 1` })
        .where(and(eq(coupons.storeId, storeId), eq(coupons.code, appliedCoupon)));
    }

    for (const line of lines) {
      for (let i = 0; i < line.qty; i++) {
        await db.insert(orderItems).values({
          storeId,
          orderId: order.id,
          productSlug: line.slug,
          productName: line.name,
          categorySlug: line.categorySlug,
          price: line.price,
          qty: 1,
          licenseKey: generateLicenseKey(),
        });
      }
    }

    return Response.json({ ok: true, orderNumber, email, discount, total });
  } catch (e) {
    console.error("checkout error", e);
    return Response.json({ error: "تعذر إتمام الطلب الآن. حاول مرة أخرى." }, { status: 500 });
  }
}
