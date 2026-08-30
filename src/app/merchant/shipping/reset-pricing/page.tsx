"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const DEFAULTS = {
  shippingPricing: [{ id: "t1", minW: 0, maxW: 1, price: 25 }, { id: "t2", minW: 1, maxW: 5, price: 45 }, { id: "t3", minW: 5, maxW: 10, price: 75 }],
  internationalBaseFee: 90,
};

export default function ResetPricingPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customized, setCustomized] = useState(true);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setCustomized(Array.isArray(s.shippingPricing) && s.shippingPricing.length > 0);
    }).finally(() => setLoaded(true));
  }, []);

  async function reset() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: DEFAULTS }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      setCustomized(false);
      toast.success("تمت استعادة التسعيرة الافتراضية");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">استعادة التسعيرة الافتراضية</h2><p className="text-sm text-ink-300 mt-1">أعد إعدادات تسعير الشحن إلى الوضع الافتراضي</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-400/15 border border-orange-400/30"><RotateCcw className="w-5 h-5 text-orange-400" /></span>
            <div>
              <p className="font-bold text-sm">{customized ? "لديك تسعيرة مخصصة" : "التسعيرة في الوضع الافتراضي"}</p>
              <p className="text-[11px] text-ink-300">سيتم استبدال التسعيرة الحالية بشرائح مسبار القياسية</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-900/40 p-3 space-y-1 text-sm">
            <p className="font-semibold mb-1">الأسعار الافتراضية:</p>
            <p className="text-ink-300 text-xs">0–1 كجم: 25 ر.س · 1–5 كجم: 45 ر.س · 5–10 كجم: 75 ر.س</p>
            <p className="text-ink-300 text-xs">الشحن الدولي الأساسي: 90 ر.س</p>
          </div>
          <button onClick={reset} disabled={saving || !customized} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} استعادة الافتراضي
          </button>
        </div>
      )}
    </div>
  );
}
