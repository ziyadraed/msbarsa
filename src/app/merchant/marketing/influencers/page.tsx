"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Inf = { id: string; name: string; handle: string; reach: number; code: string; active: boolean };

export default function InfluencersPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<Inf[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.influencers)) setList(s.influencers as Inf[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { influencers: list } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ المؤثرين");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">التسويق بالمؤثرين</h2><p className="text-sm text-ink-300 mt-1">اربط المؤثرين بأكواد تتبع وخصم</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-rose-400/15 border border-pink-400/30"><Sparkles className="w-5 h-5 text-pink-400" /></span>
              <p className="font-bold text-sm">{list.length} مؤثر</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {list.map((inf) => (
              <div key={inf.id} className="grid grid-cols-[1.2fr_1fr_1fr_auto_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={inf.name} onChange={(e) => setList((p) => p.map((x) => x.id === inf.id ? { ...x, name: e.target.value } : x))} placeholder="الاسم" />
                <input className={inp + " font-latin text-left"} value={inf.handle} onChange={(e) => setList((p) => p.map((x) => x.id === inf.id ? { ...x, handle: e.target.value } : x))} placeholder="@handle" />
                <div className="flex items-center gap-1"><input type="number" className={inp + " w-24"} value={inf.reach} onChange={(e) => setList((p) => p.map((x) => x.id === inf.id ? { ...x, reach: Number(e.target.value) } : x))} /><span className="text-[10px] text-ink-300">متابع</span></div>
                <input className={inp + " w-24 font-latin text-left"} value={inf.code} onChange={(e) => setList((p) => p.map((x) => x.id === inf.id ? { ...x, code: e.target.value } : x))} placeholder="الكود" />
                <button type="button" onClick={() => setList((p) => p.filter((x) => x.id !== inf.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا يوجد مؤثرون</p>}
          </div>
          <button type="button" onClick={() => setList((p) => [...p, { id: crypto.randomUUID(), name: "", handle: "", reach: 0, code: "", active: true }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة مؤثر
          </button>
        </div>
      )}
    </div>
  );
}
