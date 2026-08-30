"use client";

import { useEffect, useState } from "react";
import { Globe2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function InternationalPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, baseFee: 0, regions: "GCC" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({ enabled: s.internationalEnabled === true, baseFee: Number(s.internationalBaseFee ?? 0), regions: String(s.internationalRegions ?? "GCC") });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { internationalEnabled: form.enabled, internationalBaseFee: Number(form.baseFee), internationalRegions: form.regions } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الشحن الدولي");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50 disabled:opacity-50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">الشحن الدولي</h2><p className="text-sm text-ink-300 mt-1">استقبال طلبات من خارج السعودية</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><Globe2 className="w-5 h-5 text-sky-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل الشحن الدولي</p><p className="text-[11px] text-ink-300">إرسال الطلبات خارج البلاد</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-sky-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={lbl}>الرسوم الأساسية (ر.س)</span>
              <input type="number" className={inp} min={0} value={form.baseFee} onChange={(e) => setForm({ ...form, baseFee: Number(e.target.value) })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className={lbl}>المنطقة</span>
              <select className={inp} value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} disabled={!form.enabled}>
                <option>GCC</option><option>الشرق الأوسط</option><option>عالمي</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
