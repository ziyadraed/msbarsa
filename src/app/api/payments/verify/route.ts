import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchMoyasarPayment, gatewayConfig, toHalalas } from "@/lib/payments";
import { finalizeOrder, issueOrderItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * Server-side verification after the customer returns from Moyasar.
 * Never trusts the redirect query string alone — re-fetches the payment
 * with the secret key and validates status, amount and currency before
 * issuing any license keys.
 */
export async function POST(req: Request) {
  try {
    const cfg = gatewayConfig();
    if (!cfg.enabled) return Response.json({ error: "Gateway disabled" }, { status: 400 });

    const body = await req.json();
    const orderNumber = String(body?.orderNumber ?? "").trim().toUpperCase();
    const paymentId = String(body?.paymentId ?? "").trim();
    if (!orderNumber || !paymentId) {
      return Response.json({ error: "missing fields" }, { status: 400 });
    }

    const found = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!found.length) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    const order = found[0];

    const payment = await fetchMoyasarPayment(paymentId, cfg.secretKey);
    if (!payment) return Response.json({ error: "تعذر التحقق من الدفعة" }, { status: 502 });

    const expected = toHalalas(Math.round(order.total));
    const okAmount = payment.amount === expected;
    const okCurrency = payment.currency === cfg.currency;

    if (payment.status === "paid" && okAmount && okCurrency) {
      await finalizeOrder(orderNumber, payment.id);
      if (Array.isArray(order.cartSnapshot)) {
        await issueOrderItems(order.id, order.cartSnapshot);
      }
      return Response.json({ ok: true, orderNumber: order.orderNumber, email: order.email });
    }

    const reason =
      payment.status !== "paid"
        ? (payment.source?.message ?? "تم رفض الدفعة أو لم تكتمل")
        : !okAmount
          ? "مبلغ الدفعة لا يطابق مبلغ الطلب"
          : "عملة الدفعة غير مطابقة";
    return Response.json({ error: reason, status: payment.status }, { status: 402 });
  } catch (e) {
    console.error("verify payment error", e);
    return Response.json({ error: "حدث خطأ أثناء التحقق" }, { status: 500 });
  }
}
