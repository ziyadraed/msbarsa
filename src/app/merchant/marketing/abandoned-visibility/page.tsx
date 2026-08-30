"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type O = { id: string; orderNumber: string; customerName: string; total: number };

export default function AbandonedVisibilityPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [all, setAll] = useState<O[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/merchant/orders?limit=500").then((r) => r.json()),
      fetch("/api/merchant/settings").then((r) => r.json()),
    ]).then(([d, s]) => {
      setAll((Array.isArray(d.orders) ? d.orders : []).filter((o: O) => ["pending", "awaiting_payment"].includes((o as any).status)));
      setHidden((s.store?.settings?.hiddenAbandoned ?? []) as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { hiddenAbandoned: hidden } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم تحديث رؤية السلات المتروكة");
    } finally { setSaving(false); }
  }

  function toggle(id: string) {
    setHidden((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">إخفاء وإظهار السلات المتروكة</h2><p className="text-sm text-ink-300 mt-1">أخفِ سلات معينة من قوائم الاستهداف</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-400/15 border border-amber-400/30"><Eye className="w-5 h-5 text-amber-400" /></span>
              <p className="font-bold text-sm">{hidden.length} مخفيّة · {all.length} سلة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {all.map((o) => {
              const isHidden = hidden.includes(o.id);
              return (
                <button key={o.id} onClick={() => toggle(o.id)} className={`w-full flex items-center gap-3 rounded-xl border p-3 text-right ${isHidden ? "border-white/10 bg-ink-900/40 opacity-60" : "border-white/10 bg-ink-900/40"}`}>
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">{isHidden ? <EyeOff className="w-4 h-4 text-ink-300" /> : <Eye className="w-4 h-4 text-emerald-400" />}</span>
                  <div className="flex-1"><p className="text-sm font-semibold">{o.customerName}</p><p className="text-[11px] text-ink-300 font-latin">#{o.orderNumber}</p></div>
                  <span className="text-sm font-latin font-bold">{o.total.toLocaleString()} ر.س</span>
                </button>
              );
            })}
            {all.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد سلات متروكة</p>}
          </div>
        </div>
      )}
    </div>
  );
}
