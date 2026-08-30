"use client";

import { useEffect, useState } from "react";
import { Tag, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Rule = { id: string; name: string; tag: string; cond: string; value: string };

const CONDS = [
  { v: "total_gt", label: "إجمالي أكبر من" },
  { v: "total_lt", label: "إجمالي أقل من" },
  { v: "payment_cod", label: "دفع عند الاستلام" },
  { v: "shipped", label: "تم الشحن" },
];

export default function AutoTagsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.orderAutoTags)) setRules(s.orderAutoTags as Rule[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { orderAutoTags: rules } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ قواعد الوسوم التلقائية");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">الوسوم التلقائية للطلبات</h2><p className="text-sm text-ink-300 mt-1">ضع وسومًا على الطلبات تلقائيًا حسب شروط</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><Tag className="w-5 h-5 text-sky-400" /></span>
              <p className="font-bold text-sm">{rules.length} قاعدة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-ink-900/40 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inp + " flex-1"} value={r.name} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))} placeholder="اسم القاعدة" />
                  <button type="button" onClick={() => setRules((p) => p.filter((x) => x.id !== r.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
                  <select className={inp} value={r.cond} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, cond: e.target.value } : x))}>
                    {CONDS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
                  </select>
                  <input className={inp} value={r.value} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, value: e.target.value } : x))} placeholder="القيمة / الوسم" />
                  <input className={inp + " w-28"} value={r.tag} onChange={(e) => setRules((p) => p.map((x) => x.id === r.id ? { ...x, tag: e.target.value } : x))} placeholder="الوسم" />
                </div>
              </div>
            ))}
            {rules.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد قواعد</p>}
          </div>
          <button type="button" onClick={() => setRules((p) => [...p, { id: crypto.randomUUID(), name: "", tag: "", cond: "total_gt", value: "" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة قاعدة
          </button>
        </div>
      )}
    </div>
  );
}
