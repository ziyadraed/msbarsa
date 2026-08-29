/**
 * Moyasar payment gateway — server-side helpers.
 * Keys are read from environment variables only (never hard-coded):
 *   MOYASAR_SECRET_KEY        — sk_test_… / sk_live_…  (server only)
 *   MOYASAR_PUBLISHABLE_KEY   — pk_test_… / pk_live_…  (safe for browser form)
 */

export const MOYASAR_API = "https://api.moyasar.com/v1";

export function gatewayConfig() {
  const publishableKey = process.env.MOYASAR_PUBLISHABLE_KEY?.trim() ?? "";
  const secretKey = process.env.MOYASAR_SECRET_KEY?.trim() ?? "";
  return {
    publishableKey,
    secretKey,
    currency: "SAR",
    enabled: publishableKey.length > 0 && secretKey.length > 0,
  };
}

export function toHalalas(sar: number): number {
  return Math.round(sar * 100);
}

export type MoyasarPayment = {
  id: string;
  status: "initiated" | "paid" | "failed" | "authorized" | "captured" | "refunded" | "voided" | string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  source?: { type?: string; company?: string; message?: string };
};

/** Fetch a payment authoritatively using the secret key. */
export async function fetchMoyasarPayment(id: string, secretKey: string): Promise<MoyasarPayment | null> {
  try {
    const res = await fetch(`${MOYASAR_API}/payments/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as MoyasarPayment;
  } catch {
    return null;
  }
}
