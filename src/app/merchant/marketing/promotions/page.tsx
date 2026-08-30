"use client";

import { useEffect, useState } from "react";
import { Tag, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Promo = { id: string; name: string; type: string; value: number; target: string; active: boolean };

export default function PromotionsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.promotions)) setPromos(s.promotions as Promo[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { promotions: promos } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ العروض الترويجية");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">العروض الترويجية</h2><p className="text-sm text-ink-300 mt-1">أنشئ عروضًا مثل اشترِ واحدًا واحصل على الآخر مجانًا</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-rose-400/15 border border-pink-400/30"><Tag className="w-5 h-5 text-pink-400" /></span>
              <p className="font-bold text-sm">{promos.length} عرض</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {promos.map((p) => (
              <div key={p.id} className="grid grid-cols-[1.2fr_1fr_1fr_auto_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={p.name} onChange={(e) => setPromos((x) => x.map((y) => y.id === p.id ? { ...y, name: e.target.value } : y))} placeholder="اسم العرض" />
                <select className={inp} value={p.type} onChange={(e) => setPromos((x) => x.map((y) => y.id === p.id ? { ...y, type: e.target.value } : y))}>
                  <option value="bogo">اشترِ 1 واحصل على 1</option>
                  <option value="percent">خصم نسبة</option>
                  <option value="fixed">خصم مبلغ</option>
                </select>
                <input type="number" className={inp} value={p.value} onChange={(e) => setPromos((x) => x.map((y) => y.id === p.id ? { ...y, value: Number(e.target.value) } : y))} placeholder="القيمة" />
                <button type="button" onClick={() => setPromos((x) => x.map((y) => y.id === p.id ? { ...y, active: !y.active } : y))} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${p.active ? "bg-emerald-400/15 text-emerald-400" : "bg-white/10 text-ink-300"}`}>{p.active ? "نشط" : "متوقف"}</button>
                <button type="button" onClick={() => setPromos((x) => x.filter((y) => y.id !== p.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {promos.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد عروض</p>}
          </div>
          <button type="button" onClick={() => setPromos((p) => [...p, { id: crypto.randomUUID(), name: "", type: "percent", value: 0, target: "", active: true }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة عرض
          </button>
        </div>
      )}
    </div>
  );
}
