"use client";

import { useEffect, useState } from "react";
import { Gift, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: true, pointsPerSar: "1", redeemValue: "100", welcomeBonus: "50" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.loyaltyEnabled !== false,
        pointsPerSar: String(s.pointsPerSar ?? "1"),
        redeemValue: String(s.redeemValue ?? "100"),
        welcomeBonus: String(s.welcomeBonus ?? "50"),
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { ...form, loyaltyEnabled: form.enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الولاء");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">نظام ولاء العملاء</h2>
        <p className="text-sm text-ink-300 mt-1">كافئ عملاءك بنقاط ولاء مقابل مشترياتهم</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-400/15 border border-amber-400/30">
                <Gift className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <p className="font-bold">تفعيل نظام النقاط</p>
                <p className="text-[11px] text-ink-300">يكسب العملاء نقاطًا عند الشراء</p>
              </div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-amber-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">نقطة لكل (ر.س)</span>
              <input className="inp" type="number" value={form.pointsPerSar} onChange={(e) => setForm({ ...form, pointsPerSar: e.target.value })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">نقطة استرداد (ر.س)</span>
              <input className="inp" type="number" value={form.redeemValue} onChange={(e) => setForm({ ...form, redeemValue: e.target.value })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">مكافأة ترحيب (نقطة)</span>
              <input className="inp" type="number" value={form.welcomeBonus} onChange={(e) => setForm({ ...form, welcomeBonus: e.target.value })} disabled={!form.enabled} />
            </label>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-ink-300 leading-6 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>مثال: عملاءك يحصلون على <b className="text-amber-300">{form.pointsPerSar || "1"} نقطة</b> لكل ريال، و<b className="text-amber-300">{form.redeemValue || "100"} نقطة</b> تعادل ريالًا واحدًا عند الخصم، مع <b className="text-amber-300">{form.welcomeBonus || "50"} نقطة</b> ترحيبية للعميل الجديد.</span>
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الإعدادات
          </button>
        </form>
      )}
    </div>
  );
}
