"use client";

import { useEffect, useState } from "react";
import { Landmark, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type D = { id: string; bank: string; card: string; discount: number; active: boolean };

export default function BankDiscountsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<D[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.bankDiscounts)) setList(s.bankDiscounts as D[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { bankDiscounts: list } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ خصومات البنك");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">عروض وخصومات البنك</h2><p className="text-sm text-ink-300 mt-1">خصومات تظهر للعملاء حسب بطاقاتهم البنكية</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-400/15 border border-blue-400/30"><Landmark className="w-5 h-5 text-blue-400" /></span>
              <p className="font-bold text-sm">{list.length} خصم</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {list.map((d) => (
              <div key={d.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={d.bank} onChange={(e) => setList((p) => p.map((x) => x.id === d.id ? { ...x, bank: e.target.value } : x))} placeholder="البنك" />
                <input className={inp} value={d.card} onChange={(e) => setList((p) => p.map((x) => x.id === d.id ? { ...x, card: e.target.value } : x))} placeholder="نوع البطاقة" />
                <div className="flex items-center gap-1"><input type="number" className={inp + " w-20"} value={d.discount} onChange={(e) => setList((p) => p.map((x) => x.id === d.id ? { ...x, discount: Number(e.target.value) } : x))} /><span className="text-[11px] text-ink-300">%</span></div>
                <button type="button" onClick={() => setList((p) => p.filter((x) => x.id !== d.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد خصومات بنكية</p>}
          </div>
          <button type="button" onClick={() => setList((p) => [...p, { id: crypto.randomUUID(), bank: "", card: "", discount: 0, active: true }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة خصم بنك
          </button>
        </div>
      )}
    </div>
  );
}
