"use client";

import { useEffect, useState } from "react";
import { Wrench, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Svc = { id: string; name: string; price: number; active: boolean };

export default function MerchantServicesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<Svc[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.themeServices)) setList(s.themeServices as Svc[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { themeServices: list } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الخدمات");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">خدمات التاجر لتخصيص الثيم</h2><p className="text-sm text-ink-300 mt-1">خدمات مخصصة من فريق مسبار مقابل رسوم</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-400/15 border border-teal-400/30"><Wrench className="w-5 h-5 text-teal-400" /></span>
              <p className="font-bold text-sm">{list.length} خدمة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {list.map((s) => (
              <div key={s.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={s.name} onChange={(e) => setList((p) => p.map((x) => x.id === s.id ? { ...x, name: e.target.value } : x))} placeholder="اسم الخدمة" />
                <div className="flex items-center gap-1"><input type="number" className={inp + " w-24"} value={s.price} onChange={(e) => setList((p) => p.map((x) => x.id === s.id ? { ...x, price: Number(e.target.value) } : x))} /><span className="text-[11px] text-ink-300">ر.س</span></div>
                <button type="button" onClick={() => setList((p) => p.filter((x) => x.id !== s.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد خدمات</p>}
          </div>
          <button type="button" onClick={() => setList((p) => [...p, { id: crypto.randomUUID(), name: "", price: 0, active: true }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة خدمة
          </button>
        </div>
      )}
    </div>
  );
}
