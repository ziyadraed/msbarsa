"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

export default function CartAdsPaymentPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState<string[]>(["cod"]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.cartAdsPaymentMethods)) setEnabled(s.cartAdsPaymentMethods as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { cartAdsPaymentMethods: enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ طرق الدفع لإعلانات السلة");
    } finally { setSaving(false); }
  }

  const METHODS = [
    { id: "card", name: "بطاقة ائتمان" },
    { id: "cod", name: "الدفع عند الاستلام" },
    { id: "apple", name: "Apple Pay" },
    { id: "stc", name: "STC Pay" },
    { id: "wallet", name: "محفظة المتجر" },
  ];

  function toggle(id: string) {
    setEnabled((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">طرق الدفع لإعلانات سلة</h2><p className="text-sm text-ink-300 mt-1">حدد طرق الدفع المقبولة في سلة التسوق</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-400/15 border border-teal-400/30"><CreditCard className="w-5 h-5 text-teal-400" /></span>
              <p className="font-bold text-sm">{enabled.length} طريقة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {METHODS.map((m) => {
              const on = enabled.includes(m.id);
              return (
                <button key={m.id} onClick={() => toggle(m.id)} className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-right ${on ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/3"}`}>
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 border border-white/10"><CreditCard className="w-4 h-4 text-ink-300" /></span>
                  <span className="flex-1 text-sm font-bold">{m.name}</span>
                  {on && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
