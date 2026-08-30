"use client";

import { useEffect, useState } from "react";
import { Wallet, Loader2, Save, Gift } from "lucide-react";
import { toast } from "sonner";

export default function CashbackPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: true, percent: "5", minOrder: "0", expiryDays: "90" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.cashbackEnabled !== false,
        percent: String(s.cashbackPercent ?? "5"),
        minOrder: String(s.cashbackMinOrder ?? "0"),
        expiryDays: String(s.cashbackExpiryDays ?? "90"),
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { ...form, cashbackEnabled: form.enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الكاش باك");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">الكاش باك</h2>
        <p className="text-sm text-ink-300 mt-1">أرجع جزءًا من قيمة الشراء للعميل في محفظته</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <p className="font-bold">تفعيل الكاش باك</p>
                <p className="text-[11px] text-ink-300">يحصل العميل على رصيد يعود إليه</p>
              </div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-emerald-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">نسبة الكاش باك (%)</span>
              <input className="inp" type="number" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">حد أدنى للطلب (ر.س)</span>
              <input className="inp" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">صلاحية الرصيد (يوم)</span>
              <input className="inp" type="number" value={form.expiryDays} onChange={(e) => setForm({ ...form, expiryDays: e.target.value })} disabled={!form.enabled} />
            </label>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-xs text-ink-300 leading-6 flex items-start gap-2">
            <Gift className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>مثال: عند تفعيل {form.percent}%، يحصل العميل على {form.percent}% من قيمة الطلب (فوق حد {form.minOrder} ر.س) كرصيد في محفظته يُستخدَم في الطلبات القادمة.</span>
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
