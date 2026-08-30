"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Plan = { id: string; provider: string; months: number; fee: number };

export default function InstallmentsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setEnabled(s.installmentsEnabled === true);
      if (Array.isArray(s.installmentPlans)) setPlans(s.installmentPlans as Plan[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { installmentsEnabled: enabled, installmentPlans: plans } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الدفع الآجل");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">الدفع الآجل</h2><p className="text-sm text-ink-300 mt-1">قسّط مدفوعات العملاء على دفعات</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/25 to-purple-400/15 border border-viol-400/30"><CalendarClock className="w-5 h-5 text-viol-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل الدفع الآجل</p><p className="text-[11px] text-ink-300">يظهر للعملاء عند إتمام الطلب</p></div>
            <button type="button" onClick={() => setEnabled(!enabled)} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${enabled ? "bg-viol-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="space-y-2">
            {plans.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={p.provider} onChange={(e) => setPlans((x) => x.map((y) => y.id === p.id ? { ...y, provider: e.target.value } : y))} placeholder="الشركة" disabled={!enabled} />
                <input type="number" className={inp + " w-20"} value={p.months} onChange={(e) => setPlans((x) => x.map((y) => y.id === p.id ? { ...y, months: Number(e.target.value) } : y))} placeholder="أشهر" disabled={!enabled} />
                <span className="text-[11px] text-ink-300">شهر</span>
                <button type="button" onClick={() => setPlans((x) => x.filter((y) => y.id !== p.id))} className="text-ink-300 hover:text-red-400" disabled={!enabled}><X className="w-4 h-4" /></button>
              </div>
            ))}
            {plans.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد خطط تقسيط — أضف أول خطة</p>}
          </div>

          <button type="button" onClick={() => setPlans((x) => [...x, { id: crypto.randomUUID(), provider: "", months: 3, fee: 0 }])} disabled={!enabled} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400 disabled:opacity-50">
            <Plus className="w-4 h-4" /> إضافة خطة تقسيط
          </button>

          <button onClick={save} disabled={saving || !enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
