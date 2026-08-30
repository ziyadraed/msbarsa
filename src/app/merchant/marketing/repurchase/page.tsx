"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Loader2, Save, Mail } from "lucide-react";
import { toast } from "sonner";

export default function RepurchasePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: true, days: "30", message: "", couponCode: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.repurchaseEnabled !== false,
        days: String(s.repurchaseDays ?? "30"),
        message: String(s.repurchaseMessage ?? "نشتاق لزيارتك! عُد لتستكشف أحدث المنتجات"),
        couponCode: String(s.repurchaseCoupon ?? ""),
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { ...form, repurchaseEnabled: form.enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات إعادة الشراء");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">إعادة الشراء</h2>
        <p className="text-sm text-ink-300 mt-1">ذكّر عملاءك بالعودة وتجديد شراءهم</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30">
                <RotateCcw className="w-5 h-5 text-sky-400" />
              </span>
              <div>
                <p className="font-bold">تفعيل التذكير بإعادة الشراء</p>
                <p className="text-[11px] text-ink-300">تذكير تلقائي بعد فترة من آخر شراء</p>
              </div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-sky-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">إرسال بعد (يوم)</span>
              <input className="inp" type="number" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">كوبون خصم (اختياري)</span>
              <input className="inp font-latin" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} disabled={!form.enabled} />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> نص الرسالة</span>
            <textarea className="inp" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} disabled={!form.enabled} />
          </label>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
