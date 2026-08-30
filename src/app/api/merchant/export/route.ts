import { db } from "@/db";
import { orders, orderItems, customers, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

function csv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

export async function GET(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "orders";

  if (type === "customers") {
    const rows = await db.select().from(customers).where(eq(customers.storeId, storeId)).orderBy(desc(customers.totalSpent));
    const out = csv([
      ["الاسم", "البريد", "الجوال", "عدد الطلبات", "إجمالي الإنفاق"],
      ...rows.map((c) => [c.name, c.email, c.phone, c.orderCount, c.totalSpent]),
    ]);
    return csvResponse(out, "customers.csv");
  }

  if (type === "products") {
    const rows = await db.select().from(products).where(eq(products.storeId, storeId)).orderBy(desc(products.createdAt));
    const out = csv([
      ["الاسم", "SKU", "القسم", "السعر", "المخزون", "الحالة"],
      ...rows.map((p) => [p.name, p.sku, p.categorySlug, p.price, p.stock, p.status]),
    ]);
    return csvResponse(out, "products.csv");
  }

  // default orders (with line items)
  const rows = await db.select().from(orders).where(eq(orders.storeId, storeId)).orderBy(desc(orders.createdAt));
  const withItems = await Promise.all(
    rows.map(async (o) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      return { o, items };
    })
  );
  const out = csv([
    ["رقم الطلب", "العميل", "البريد", "المنتجات", "الإجمالي", "الحالة", "التاريخ"],
    ...withItems.map(({ o, items }) => [
      o.orderNumber,
      o.customerName,
      o.email,
      items.map((i) => `${i.productName} x${i.qty}`).join(" | "),
      o.total,
      o.status,
      new Date(o.createdAt).toISOString(),
    ]),
  ]);
  return csvResponse(out, "orders.csv");
}

function csvResponse(data: string, filename: string) {
  const buffer = Buffer.from("\uFEFF" + data, "utf8");
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
