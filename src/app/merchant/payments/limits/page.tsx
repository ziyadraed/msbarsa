"use client";

import { useEffect, useState } from "react";
import { Gauge, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function PaymentLimitsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ min: 0, max: 0, maxPerDay: 0 });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({ min: Number(s.payMinLimit ?? 0), max: Number(s.payMaxLimit ?? 0), maxPerDay: Number(s.payMaxPerDay ?? 0) });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { payMinLimit: Number(form.min), payMaxLimit: Number(form.max), payMaxPerDay: Number(form.maxPerDay) } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ حدود المعاملات");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">حدود معاملات الدفع</h2><p className="text-sm text-ink-300 mt-1">ضبط حدود قبول المدفوعات لحماية المتجر</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-400/15 border border-amber-400/30"><Gauge className="w-5 h-5 text-amber-400" /></span>
            <div><p className="font-bold text-sm">حدود بالريال السعودي</p><p className="text-[11px] text-ink-300">0 = بدون حد</p></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className={lbl}>الحد الأدنى للطلب</span>
              <input type="number" className={inp} min={0} value={form.min} onChange={(e) => setForm({ ...form, min: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={lbl}>الحد الأقصى للطلب</span>
              <input type="number" className={inp} min={0} value={form.max} onChange={(e) => setForm({ ...form, max: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={lbl}>الحد الأقصى اليومي</span>
              <input type="number" className={inp} min={0} value={form.maxPerDay} onChange={(e) => setForm({ ...form, maxPerDay: Number(e.target.value) })} />
            </label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
