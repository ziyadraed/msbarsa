"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function PreOrderPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, shipDate: "", note: "", collectDeposit: false, depositPct: 50 });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.preOrderEnabled === true, shipDate: String(s.preOrderShipDate ?? ""),
        note: String(s.preOrderNote ?? "متوفر للطلب المسبق"), collectDeposit: s.preOrderDeposit === true,
        depositPct: Number(s.preOrderDepositPct ?? 50),
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { preOrderEnabled: form.enabled, preOrderShipDate: form.shipDate, preOrderNote: form.note, preOrderDeposit: form.collectDeposit, preOrderDepositPct: Number(form.depositPct) } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الطلب المسبق");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50 disabled:opacity-50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">حملات الطلب المسبق</h2><p className="text-sm text-ink-300 mt-1">بيع المنتجات غير المتوفرة بعد مع شحن مؤجل</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-400/15 border border-orange-400/30"><CalendarClock className="w-5 h-5 text-orange-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل الطلب المسبق</p><p className="text-[11px] text-ink-300">بيع بمنتجات غير متوفرة بعد</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-orange-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <label className="block">
            <span className={lbl}>تاريخ الشحن المتوقع</span>
            <input type="date" className={inp} value={form.shipDate} onChange={(e) => setForm({ ...form, shipDate: e.target.value })} disabled={!form.enabled} />
          </label>
          <label className="block">
            <span className={lbl}>ملاحظة للمنتج</span>
            <input className={inp} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} disabled={!form.enabled} />
          </label>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
            <div><p className="text-sm font-semibold">تحصيل دفعة مسبقة</p><p className="text-[11px] text-ink-300">نسبة من السعر عند الطلب</p></div>
            <button type="button" onClick={() => setForm({ ...form, collectDeposit: !form.collectDeposit })} disabled={!form.enabled} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.collectDeposit ? "bg-orange-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.collectDeposit ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          {form.collectDeposit && (
            <label className="block">
              <span className={lbl}>نسبة الدفعة المسبقة (%)</span>
              <input type="number" className={inp} min={0} max={100} value={form.depositPct} onChange={(e) => setForm({ ...form, depositPct: Number(e.target.value) })} />
            </label>
          )}
          <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
