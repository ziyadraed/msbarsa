import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchMoyasarPayment, gatewayConfig, toHalalas } from "@/lib/payments";
import { finalizeOrder, issueOrderItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * Moyasar webhook receiver (configure the URL in your Moyasar dashboard).
 * The payload is never trusted directly: we re-fetch the payment authoritatively
 * with the secret key, so spoofed webhook calls cannot fulfill orders.
 */
export async function POST(req: Request) {
  try {
    const cfg = gatewayConfig();
    if (!cfg.enabled) return Response.json({ received: true });

    const event = await req.json();
    const paymentId: string | undefined = event?.data?.id ?? event?.data?.payment?.id;
    if (!paymentId) return Response.json({ received: true });

    const payment = await fetchMoyasarPayment(paymentId, cfg.secretKey);
    if (!payment || payment.status !== "paid") return Response.json({ received: true });

    const orderNumber = payment.metadata?.order ?? "";
    if (!orderNumber) return Response.json({ received: true });

    const found = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber.toUpperCase())).limit(1);
    if (!found.length) return Response.json({ received: true });
    const order = found[0];

    if (payment.amount === toHalalas(Math.round(order.total)) && payment.currency === cfg.currency) {
      await finalizeOrder(order.orderNumber, payment.id);
      if (Array.isArray(order.cartSnapshot)) {
        await issueOrderItems(order.id, order.storeId, order.cartSnapshot);
      }
    }
    return Response.json({ received: true });
  } catch (e) {
    console.error("webhook error", e);
    return Response.json({ received: true });
  }
}
