"use client";

import { useEffect, useState } from "react";
import { Megaphone, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function MarketingSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ defaultCurrency: "SAR", timezone: "Riyadh", emailOptin: true, consent: true });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        defaultCurrency: String(s.mktCurrency ?? "SAR"),
        timezone: String(s.mktTimezone ?? "Riyadh"),
        emailOptin: s.mktEmailOptin !== false,
        consent: s.mktConsent !== false,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { mktCurrency: form.defaultCurrency, mktTimezone: form.timezone, mktEmailOptin: form.emailOptin, mktConsent: form.consent } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات التسويق");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  function Toggle({ label, val, onChange }: { label: string; val: boolean; onChange: () => void }) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
        <span className="text-sm font-semibold">{label}</span>
        <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${val ? "bg-neon-500" : "bg-white/15"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${val ? "right-0.5" : "right-5.5"}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">إعدادات التسويق</h2><p className="text-sm text-ink-300 mt-1">التفضيلات العامة لحملاتك التسويقية</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-pink-400/15 border border-rose-400/30"><Megaphone className="w-5 h-5 text-rose-400" /></span>
            <p className="font-bold text-sm">تفضيلات عامة</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={lbl}>العملة الافتراضية</span>
              <select className={inp} value={form.defaultCurrency} onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}>
                <option>SAR</option><option>AED</option><option>KWD</option><option>QAR</option><option>USD</option>
              </select>
            </label>
            <label className="block">
              <span className={lbl}>المنطقة الزمنية</span>
              <select className={inp} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                <option>Riyadh</option><option>Dubai</option><option>Kuwait</option>
              </select>
            </label>
          </div>
          <div className="space-y-2">
            <Toggle label="السماح بالاشتراك في النشرة" val={form.emailOptin} onChange={() => setForm({ ...form, emailOptin: !form.emailOptin })} />
            <Toggle label="موافقة التواصل التسويقي" val={form.consent} onChange={() => setForm({ ...form, consent: !form.consent })} />
          </div>
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
