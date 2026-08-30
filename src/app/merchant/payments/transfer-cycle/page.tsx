"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const CYCLE_OPTIONS = ["يومي", "أسبوعي", "نصف شهري", "شهري"];

export default function TransferCyclePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ cycle: "أسبوعي", minimum: 100, enabled: true });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        cycle: CYCLE_OPTIONS.includes(String(s.transferCycle)) ? String(s.transferCycle) : "أسبوعي",
        minimum: Number(s.transferMinimum ?? 100),
        enabled: s.transferEnabled !== false,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { transferCycle: form.cycle, transferMinimum: Number(form.minimum), transferEnabled: form.enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ دورة التحويل");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">دورة تحويل المدفوعات</h2><p className="text-sm text-ink-300 mt-1">متى وكيف تُحوَّل أموالك إلى حسابك البنكي</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-cyan-400/15 border border-teal-400/30"><RefreshCw className="w-5 h-5 text-teal-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">التحويل التلقائي</p><p className="text-[11px] text-ink-300">حول الأرباح تلقائيًا إلى حسابك</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-teal-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <label className="block">
            <span className={lbl}>دورة التحويل</span>
            <div className="flex flex-wrap gap-2">
              {CYCLE_OPTIONS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, cycle: c })} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${form.cycle === c ? "bg-neon-400/15 text-neon-400 border border-neon-400/30" : "bg-white/5 text-ink-300 border border-white/10"}`} disabled={!form.enabled}>{c}</button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className={lbl}>الحد الأدنى للتحويل (ر.س)</span>
            <input type="number" className={inp} min={0} value={form.minimum} onChange={(e) => setForm({ ...form, minimum: Number(e.target.value) })} disabled={!form.enabled} />
          </label>
          <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
