import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { priceMap } from "@/lib/data";
import { generateLicenseKey, generateOrderNumber, validEmail } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type CartLine = { slug: string; qty: number };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();
    const paymentMethod = ["card", "mada", "applepay"].includes(body?.paymentMethod) ? body.paymentMethod : "card";
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
    const total = subtotal;

    const user = await getSessionUser();
    const orderNumber = generateOrderNumber();

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: user?.id ?? null,
        customerName: name,
        email,
        phone,
        paymentMethod,
        subtotal,
        discount: 0,
        total,
        status: "paid",
      })
      .returning({ id: orders.id });

    for (const line of lines) {
      for (let i = 0; i < line.qty; i++) {
        await db.insert(orderItems).values({
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

    return Response.json({ ok: true, orderNumber, email });
  } catch (e) {
    console.error("checkout error", e);
    return Response.json({ error: "تعذر إتمام الطلب الآن. حاول مرة أخرى." }, { status: 500 });
  }
}
