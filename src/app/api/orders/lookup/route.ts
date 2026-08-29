import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Public self-service order lookup: requires the order number + the email used at checkout. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderNumber = String(body?.orderNumber ?? "").trim().toUpperCase();
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!orderNumber || !email) {
      return Response.json({ error: "أدخل رقم الطلب والبريد الإلكتروني" }, { status: 400 });
    }
    const found = await db
      .select()
      .from(orders)
      .where(and(eq(orders.orderNumber, orderNumber), sql`lower(${orders.email}) = ${email}`))
      .limit(1);
    if (!found.length) {
      return Response.json({ error: "لم يتم العثور على طلب بهذه البيانات" }, { status: 404 });
    }
    const order = found[0];
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return Response.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        email: order.email,
        paymentMethod: order.paymentMethod,
        total: order.total,
        createdAt: order.createdAt,
        items: items.map((it) => ({
          productName: it.productName,
          productSlug: it.productSlug,
          categorySlug: it.categorySlug,
          price: it.price,
          licenseKey: it.licenseKey,
        })),
      },
    });
  } catch (e) {
    console.error("lookup error", e);
    return Response.json({ error: "تعذر تنفيذ الطلب" }, { status: 500 });
  }
}
