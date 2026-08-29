import { gatewayConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** Tells the checkout whether the live gateway is configured (runtime, no rebuild needed). */
export async function GET() {
  const cfg = gatewayConfig();
  return Response.json({
    enabled: cfg.enabled,
    publishableKey: cfg.enabled ? cfg.publishableKey : null,
    currency: cfg.currency,
  });
}
