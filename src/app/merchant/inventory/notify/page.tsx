"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function NotifyPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: true, emailTemplate: "", autoSubscribe: true });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.notifyEnabled !== false,
        emailTemplate: String(s.notifyTemplate ?? "المنتج متوفر الآن! اطلبه قبل نفاد الكمية."),
        autoSubscribe: s.notifyAutoSubscribe !== false,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { notifyEnabled: form.enabled, notifyTemplate: form.emailTemplate, notifyAutoSubscribe: form.autoSubscribe } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات إشعارات التوفر");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50 disabled:opacity-50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">أعلمني عند التوفر</h2><p className="text-sm text-ink-300 mt-1">أبلغ العملاء عند عودة المنتج النافد للتوفر</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-400/15 border border-blue-400/30"><Bell className="w-5 h-5 text-blue-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل زر \"أعلمني عند التوفر\"</p><p className="text-[11px] text-ink-300">يظهر على المنتجات النافدة</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-blue-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <label className="block">
            <span className={lbl}>قالب رسالة الإشعار</span>
            <textarea className={inp} rows={3} value={form.emailTemplate} onChange={(e) => setForm({ ...form, emailTemplate: e.target.value })} disabled={!form.enabled} />
          </label>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
            <span className="text-sm font-semibold">اشتراك تلقائي للمنتجات النافدة</span>
            <button type="button" onClick={() => setForm({ ...form, autoSubscribe: !form.autoSubscribe })} disabled={!form.enabled} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.autoSubscribe ? "bg-blue-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.autoSubscribe ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
