"use client";

import { useEffect, useState } from "react";
import { Truck, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Co = { id: string; name: string; fee: number; cod: boolean };

export default function PrivateCompanyPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<Co[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.privateCouriers)) setList(s.privateCouriers as Co[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { privateCouriers: list } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ شركات الشحن الخاصة");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">شركة شحن خاصة</h2><p className="text-sm text-ink-300 mt-1">أضف شركات الشحن الخاصة بك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-cyan-400/15 border border-teal-400/30"><Truck className="w-5 h-5 text-teal-400" /></span>
              <p className="font-bold text-sm">{list.length} شركة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {list.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={c.name} onChange={(e) => setList((p) => p.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} placeholder="اسم الشركة" />
                <input type="number" className={inp + " w-24"} value={c.fee} onChange={(e) => setList((p) => p.map((x) => x.id === c.id ? { ...x, fee: Number(e.target.value) } : x))} />
                <label className="flex items-center gap-1 text-[11px] text-ink-300">
                  <input type="checkbox" checked={c.cod} onChange={(e) => setList((p) => p.map((x) => x.id === c.id ? { ...x, cod: e.target.checked } : x))} /> COD
                </label>
                <button type="button" onClick={() => setList((p) => p.filter((x) => x.id !== c.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد شركات خاصة</p>}
          </div>
          <button type="button" onClick={() => setList((p) => [...p, { id: crypto.randomUUID(), name: "", fee: 0, cod: true }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة شركة
          </button>
        </div>
      )}
    </div>
  );
}
