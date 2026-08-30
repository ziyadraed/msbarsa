"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function ReadinessPage() {
  const [loaded, setLoaded] = useState(false);
  const [checks, setChecks] = useState<{ label: string; ready: boolean; note: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/merchant/settings").then((r) => r.json()),
      fetch("/api/merchant/products").then((r) => r.json()),
    ]).then(([set, prod]) => {
      const s = set.store?.settings ?? {};
      const hasHs = Array.isArray(s.hsCodes) && s.hsCodes.length > 0;
      const hasCourier = Array.isArray(s.privateCouriers) && s.privateCouriers.length > 0;
      const intlEnabled = s.internationalEnabled === true;
      const products = Array.isArray(prod.products) ? prod.products.length : 0;
      setChecks([
        { label: "تفعيل الشحن الدولي", ready: intlEnabled, note: intlEnabled ? "مفعّل" : "فعّل الشحن الدولي" },
        { label: "أكواد HS للمنتجات", ready: hasHs, note: hasHs ? `${s.hsCodes.length} كود` : "أضف أكواد HS" },
        { label: "شركات شحن خاصة", ready: hasCourier, note: hasCourier ? `${s.privateCouriers.length} شركة` : "أضف شركة شحن" },
        { label: "منتجات جاهزة", ready: products > 0, note: `${products} منتج` },
      ]);
    }).finally(() => setLoaded(true));
  }, []);

  const ready = checks.filter((c) => c.ready).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">جاهزية الشحن الدولي</h2><p className="text-sm text-ink-300 mt-1">تحقق من جاهزية متجرك للشحن الدولي</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحقق...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className={`rounded-2xl border p-4 text-center mb-2 ${ready === checks.length ? "border-emerald-400/30 bg-emerald-400/10" : "border-amber-400/30 bg-amber-400/10"}`}>
            <p className="text-3xl font-black">{ready}/{checks.length}</p>
            <p className="text-xs text-ink-300">{ready === checks.length ? "متجرك جاهز للشحن الدولي ✓" : "أكمل الخطوات لتصبح جاهزًا"}</p>
          </div>
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
              {c.ready ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-amber-400 shrink-0" />}
              <p className="flex-1 text-sm font-semibold">{c.label}</p>
              <span className={`text-[11px] ${c.ready ? "text-emerald-400" : "text-amber-400"}`}>{c.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
