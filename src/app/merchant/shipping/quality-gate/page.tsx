"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Rule = { id: string; criterion: string; operator: string; value: number; action: string };

export default function QualityGatePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setEnabled(s.qualityGateEnabled === true);
      if (Array.isArray(s.qualityRules)) setRules(s.qualityRules as Rule[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { qualityGateEnabled: enabled, qualityRules: rules } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ بوابة الجودة");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">بوابة الجودة</h2><p className="text-sm text-ink-300 mt-1">معايير تحدد أفضل شركة شحن لكل شحنة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><ShieldCheck className="w-5 h-5 text-emerald-400" /></span>
              <p className="font-bold text-sm">تفعيل بوابة الجودة</p>
            </div>
            <button type="button" onClick={() => setEnabled(!enabled)} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${enabled ? "bg-emerald-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm">{rules.length} قاعدة</p>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={r.criterion} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, criterion: e.target.value } : x))} placeholder="المعيار" />
                <select className={inp} value={r.operator} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, operator: e.target.value } : x))}>
                  <option>أقل من</option><option>أكبر من</option><option>أو يساوي</option>
                </select>
                <input type="number" className={inp + " w-20"} value={r.value} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, value: Number(e.target.value) } : x))} />
                <input className={inp} value={r.action} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, action: e.target.value } : x))} placeholder="الإجراء" />
                <button type="button" onClick={() => setRules((p) => p.filter((x) => x.id !== r.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {rules.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد قواعد جودة</p>}
          </div>
          <button type="button" onClick={() => setRules((p) => [...p, { id: crypto.randomUUID(), criterion: "", operator: "أقل من", value: 0, action: "" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة قاعدة
          </button>
        </div>
      )}
    </div>
  );
}
