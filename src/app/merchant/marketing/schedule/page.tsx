"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Slot = { id: string; name: string; day: string; time: string; active: boolean };

export default function SchedulePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.marketingSchedule)) setSlots(s.marketingSchedule as Slot[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { marketingSchedule: slots } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الجدول الزمني");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";
  const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">الجدول الزمني للتسويق</h2><p className="text-sm text-ink-300 mt-1">جدولة إرسال الرسائل والحملات التلقائية</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><CalendarDays className="w-5 h-5 text-viol-400" /></span>
              <p className="font-bold text-sm">{slots.length} جدول</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {slots.map((s) => (
              <div key={s.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={s.name} onChange={(e) => setSlots((p) => p.map((x) => x.id === s.id ? { ...x, name: e.target.value } : x))} placeholder="اسم الحملة" />
                <select className={inp} value={s.day} onChange={(e) => setSlots((p) => p.map((x) => x.id === s.id ? { ...x, day: e.target.value } : x))}>
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <input type="time" className={inp + " w-28"} value={s.time} onChange={(e) => setSlots((p) => p.map((x) => x.id === s.id ? { ...x, time: e.target.value } : x))} />
                <button type="button" onClick={() => setSlots((p) => p.filter((x) => x.id !== s.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {slots.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد جداول</p>}
          </div>
          <button type="button" onClick={() => setSlots((p) => [...p, { id: crypto.randomUUID(), name: "", day: "الأحد", time: "10:00", active: true }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة جدول
          </button>
        </div>
      )}
    </div>
  );
}
