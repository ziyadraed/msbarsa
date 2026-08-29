import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { gatewayConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Called from the Moyasar form's `on_completed` event — stores the payment ID
 * on the pending order before the customer leaves for 3-D Secure.
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

    await db
      .update(orders)
      .set({ paymentId })
      .where(and(eq(orders.orderNumber, orderNumber), eq(orders.status, "awaiting_payment")));

    return Response.json({ ok: true });
  } catch (e) {
    console.error("attach payment error", e);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
