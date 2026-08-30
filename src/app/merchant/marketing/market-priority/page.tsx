"use client";

import { useEffect, useState } from "react";
import { ListOrdered, Loader2, Save, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string };

export default function MarketPriorityPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<P[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.marketPriority)) setList(s.marketPriority as P[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { marketPriority: list } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ أولوية العروض");
    } finally { setSaving(false); }
  }

  function move(i: number, dir: -1 | 1) {
    setList((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const c = [...p]; [c[i], c[j]] = [c[j], c[i]]; return c;
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">أولوية العروض حسب السوق</h2><p className="text-sm text-ink-300 mt-1">رتّب الأسواق التي تُطبَّق عليها العروض أولًا</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-blue-400/15 border border-indigo-400/30"><ListOrdered className="w-5 h-5 text-indigo-400" /></span>
              <p className="font-bold text-sm">{list.length} سوق</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {list.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} className="text-ink-300 hover:text-neon-400 disabled:opacity-30" disabled={i === 0}><MoveUp className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="text-ink-300 hover:text-neon-400 disabled:opacity-30" disabled={i === list.length - 1}><MoveDown className="w-3.5 h-3.5" /></button>
                </div>
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold">{i + 1}</span>
                <p className="flex-1 text-sm font-semibold">{p.name}</p>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد أسواق مرتبة</p>}
          </div>
        </div>
      )}
    </div>
  );
}
