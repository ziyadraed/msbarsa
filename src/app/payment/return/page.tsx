"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CircleAlert } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";

function ReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const cart = useCart();
  const [state, setState] = useState<"verifying" | "failed">("verifying");
  const [message, setMessage] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const orderNumber = (params.get("order") ?? "").toUpperCase();
    const paymentId = params.get("id") ?? "";
    const gwMessage = params.get("message");

    if (!orderNumber || !paymentId) {
      setState("failed");
      setMessage(gwMessage || "وصلنا رد غير كامل من بوابة الدفع.");
      return;
    }

    (async () => {
      try {
        const r = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber, paymentId }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "تعذر التحقق من الدفعة");

        try {
          sessionStorage.setItem(`msbar_order_${orderNumber}`, JSON.stringify({ orderNumber, email: d.email, ts: Date.now() }));
        } catch {
          /* ignore */
        }
        cart.clear();
        router.replace(`/order/${orderNumber}`);
      } catch (e) {
        setState("failed");
        setMessage(e instanceof Error ? e.message : "تعذر التحقق من الدفعة");
      }
    })();
  }, [params, router, cart]);

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="text-center max-w-md">
        {state === "verifying" ? (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-neon-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold">جارٍ التحقق من الدفعة…</h1>
            <p className="text-ink-300 mt-4 leading-8 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              نتحقق من الدفعة لدى البوابة قبل إصدار الأكواد — لحظات من فضلك.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 rounded-3xl glass grid place-items-center mb-7">
              <CircleAlert className="w-9 h-9 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold">لم تكتمل عملية الدفع</h1>
            <p className="text-ink-300 mt-4 leading-8">{message}</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/checkout" className="btn-primary rounded-2xl px-8 py-4 font-bold">
                إعادة المحاولة
              </Link>
              <Link href="/support" className="btn-ghost rounded-2xl px-8 py-4 font-semibold">
                تواصل مع الدعم
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense>
      <ReturnInner />
    </Suspense>
  );
}
