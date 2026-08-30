"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type Rule = { id: string; label: string; enabled: boolean };

export default function FraudPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<Rule[]>([
    { id: "velocity", label: "الحد من عدد الطلبات المتشابهة السريعة", enabled: true },
    { id: "highrisk", label: "حظر البلدان عالية المخاطر", enabled: true },
    { id: "bin", label: "التحقق من نطاق البطاقة (BIN)", enabled: false },
    { id: "avs", label: "مطابقة عنوان الدفع", enabled: false },
    { id: "manual", label: "مراجعة يدوية للطلبات المشبوهة", enabled: true },
  ]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.fraudRules)) {
        const stored = s.fraudRules as Rule[];
        if (stored.length) setRules(stored);
      }
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { fraudRules: rules } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ قواعد مكافحة الاحتيال");
    } finally {
      setSaving(false);
    }
  }

  function toggle(id: string) {
    setRules((p) => p.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">قيود الدفع ومكافحة الاحتيال</h2><p className="text-sm text-ink-300 mt-1">طبقات حماية لتقليل عمليات الاحتيال</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-red-400/15 border border-rose-400/30"><ShieldCheck className="w-5 h-5 text-rose-400" /></span>
              <p className="font-bold text-sm">{rules.filter((r) => r.enabled).length} قاعدة مفعّلة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${r.enabled ? "text-emerald-400" : "text-ink-300"}`} />
                  <span className="text-sm font-semibold">{r.label}</span>
                </div>
                <button type="button" onClick={() => toggle(r.id)} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${r.enabled ? "bg-emerald-500" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${r.enabled ? "right-0.5" : "right-5.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
