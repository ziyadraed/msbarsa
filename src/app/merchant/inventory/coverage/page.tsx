"use client";

import { useEffect, useState } from "react";
import { MapPinned, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Zone = { id: string; branch: string; cities: string[] };

export default function CoveragePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.branchCoverage)) setZones(s.branchCoverage as Zone[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { branchCoverage: zones } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ نطاق تغطية الفروع");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">نطاق تغطية الفروع</h2><p className="text-sm text-ink-300 mt-1">حدد المدن التي يغطيها كل فرع</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><MapPinned className="w-5 h-5 text-viol-400" /></span>
              <p className="font-bold text-sm">{zones.length} منطقة تغطية</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-3">
            {zones.map((z) => (
              <div key={z.id} className="rounded-xl border border-white/10 bg-ink-900/40 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inp + " flex-1"} value={z.branch} onChange={(e) => setZones((p) => p.map((x) => x.id === z.id ? { ...x, branch: e.target.value } : x))} placeholder="اسم الفرع" />
                  <button type="button" onClick={() => setZones((p) => p.filter((x) => x.id !== z.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {z.cities.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs text-ink-200">
                      {c}
                      <button type="button" onClick={() => setZones((p) => p.map((x) => x.id === z.id ? { ...x, cities: x.cities.filter((_, j) => j !== i) } : x))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className={inp + " flex-1"} placeholder="إضافة مدينة..." 
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = (e.target as HTMLInputElement).value.trim();
                        if (v) setZones((p) => p.map((x) => x.id === z.id ? { ...x, cities: [...x.cities, v] } : x));
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            {zones.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد مناطق تغطية</p>}
          </div>
          <button type="button" onClick={() => setZones((p) => [...p, { id: crypto.randomUUID(), branch: "", cities: [] }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة منطقة تغطية
          </button>
        </div>
      )}
    </div>
  );
}
