"use client";

import { useEffect, useState } from "react";
import { GitBranch, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type St = { id: string; name: string; color: string };

const COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function OrderStatusesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<St[]>([
    { id: "new", name: "جديد", color: "#3b82f6" },
    { id: "processing", name: "قيد التجهيز", color: "#f59e0b" },
    { id: "shipped", name: "تم الشحن", color: "#8b5cf6" },
    { id: "delivered", name: "تم التسليم", color: "#10b981" },
    { id: "cancelled", name: "ملغي", color: "#f43f5e" },
  ]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.orderStatuses) && (s.orderStatuses as St[]).length) setStatuses(s.orderStatuses as St[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { orderStatuses: statuses } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ حالات الطلب");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">تخصيص حالات الطلب</h2><p className="text-sm text-ink-300 mt-1">أعد تسمية حالات الطلب وألوانها بما يناسب سير عملك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><GitBranch className="w-5 h-5 text-sky-400" /></span>
              <p className="font-bold text-sm">{statuses.length} حالة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {statuses.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input
                  type="color" value={s.color}
                  onChange={(e) => setStatuses((p) => p.map((x) => x.id === s.id ? { ...x, color: e.target.value } : x))}
                  className="w-9 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                />
                <input className={inp + " flex-1"} value={s.name} onChange={(e) => setStatuses((p) => p.map((x) => x.id === s.id ? { ...x, name: e.target.value } : x))} />
                <button type="button" onClick={() => setStatuses((p) => p.filter((x) => x.id !== s.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setStatuses((p) => [...p, { id: "st" + Date.now(), name: "حالة جديدة", color: COLORS[p.length % COLORS.length] }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة حالة
          </button>
        </div>
      )}
    </div>
  );
}
