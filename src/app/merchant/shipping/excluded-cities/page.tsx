"use client";

import { useEffect, useState } from "react";
import { MapPinned, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

const SUGGESTIONS = ["جدة", "الرياض", "الدمام", "مكة", "المدينة", "الخبر", "الطائف", "أبها"];

export default function ExcludedCitiesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setEnabled(s.excludeCitiesEnabled === true);
      if (Array.isArray(s.excludedCities)) setCities(s.excludedCities as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { excludeCitiesEnabled: enabled, excludedCities: cities } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ استثناء المدن");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">استثناء مدن من الشحن</h2><p className="text-sm text-ink-300 mt-1">حدد مدنًا لا تُشحن إليها</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-red-400/15 border border-rose-400/30"><MapPinned className="w-5 h-5 text-rose-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل استثناء المدن</p><p className="text-[11px] text-ink-300">لا نُشحن إلى هذه المدن</p></div>
            <button type="button" onClick={() => setEnabled(!enabled)} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${enabled ? "bg-rose-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((c) => (
              <button key={c} type="button" onClick={() => setCities((p) => (p.includes(c) ? p : [...p, c]))} disabled={!enabled} className="px-3 py-1.5 rounded-lg text-xs border border-white/10 bg-white/5 text-ink-300 hover:text-neon-400 disabled:opacity-50">
                {cities.includes(c) ? "✓ " : "+ "}{c}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {cities.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5">
                <MapPinned className="w-4 h-4 text-ink-300 shrink-0" />
                <span className="flex-1 text-sm font-semibold">{c}</span>
                <button type="button" onClick={() => setCities((p) => p.filter((_, j) => j !== i))} disabled={!enabled} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {cities.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا مدن مستثناة</p>}
          </div>

          <button onClick={save} disabled={saving || !enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
