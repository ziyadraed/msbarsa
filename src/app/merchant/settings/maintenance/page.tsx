"use client";

import { useEffect, useState } from "react";
import { Wrench, Loader2, Save, Eye } from "lucide-react";
import { toast } from "sonner";

export default function MaintenancePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, message: "", allowAdmin: true });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.maintenanceEnabled === true,
        message: String(s.maintenanceMessage ?? "المتجر قيد الصيانة حاليًا — عد لاحقًا"),
        allowAdmin: s.maintenanceAllowAdmin !== false,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { ...form, maintenanceEnabled: form.enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success(form.enabled ? "تم تفعيل وضع الصيانة" : "تم إيقاف وضع الصيانة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">وضع الصيانة</h2>
        <p className="text-sm text-ink-300 mt-1">أوقف متجرك مؤقتًا عن العملاء أثناء الصيانة</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className={`flex items-center justify-between rounded-2xl border p-4 ${form.enabled ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-ink-900/40"}`}>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-400/15 border border-amber-400/30">
                <Wrench className={`w-5 h-5 ${form.enabled ? "text-amber-400" : "text-ink-300"}`} />
              </span>
              <div>
                <p className="font-bold">{form.enabled ? "المتجر في وضع الصيانة" : "المتجر يعمل بشكل طبيعي"}</p>
                <p className="text-[11px] text-ink-300">{form.enabled ? "الزوار سيرون صفحة الصيانة" : "تفعيل الصيانة يوقف المبيعات مؤقتًا"}</p>
              </div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-amber-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">رسالة الصيانة</span>
            <textarea className="inp" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} disabled={!form.enabled} />
          </label>

          <button type="button" onClick={() => setForm({ ...form, allowAdmin: !form.allowAdmin })} disabled={!form.enabled} className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-right disabled:opacity-50">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-neon-400" />
              <div>
                <p className="text-sm font-semibold">السماح لك بالدخول أثناء الصيانة</p>
                <p className="text-[11px] text-ink-300 mt-0.5">تبقى لوحة التحكم متاحة لك دائمًا</p>
              </div>
            </div>
            <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.allowAdmin ? "bg-neon-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.allowAdmin ? "right-0.5" : "right-5.5"}`} />
            </span>
          </button>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
