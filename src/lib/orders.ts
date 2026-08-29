import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateLicenseKey } from "@/lib/utils";

/**
 * Mark an order as paid and issue its license keys — idempotent:
 * safe to call from the return page AND the webhook; keys are issued once.
 */
export async function finalizeOrder(orderNumber: string, paymentId?: string): Promise<boolean> {
  const found = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!found.length) return false;
  const order = found[0];

  if (order.status === "paid") {
    if (paymentId && !order.paymentId) {
      await db.update(orders).set({ paymentId }).where(eq(orders.id, order.id));
    }
    return true;
  }

  // Issue keys only now — after the gateway confirmed payment.
  await db
    .update(orders)
    .set({ status: "paid", ...(paymentId ? { paymentId } : {}) })
    .where(eq(orders.id, order.id));
  return true;
}

import type { PendingLine } from "@/db/schema";

export async function issueOrderItems(orderId: string, lines: PendingLine[]): Promise<void> {
  const existing = await db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.orderId, orderId)).limit(1);
  if (existing.length) return; // already issued (idempotent)
  for (const line of lines) {
    for (let i = 0; i < line.qty; i++) {
      await db.insert(orderItems).values({
        orderId,
        productSlug: line.slug,
        productName: line.name,
        categorySlug: line.categorySlug,
        price: line.price,
        qty: 1,
        licenseKey: generateLicenseKey(),
      });
    }
  }
}
