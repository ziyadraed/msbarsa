"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function CourierRestrictionsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ cod: boolean; fragile: boolean; maxWeight: number }>({ cod: true, fragile: false, maxWeight: 30 });
  type ToggleKey = "cod" | "fragile";

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({ cod: s.restrictCod !== false, fragile: s.restrictFragile === true, maxWeight: Number(s.restrictMaxWeight ?? 30) });
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { restrictCod: form.cod, restrictFragile: form.fragile, restrictMaxWeight: Number(form.maxWeight) } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ قيود شركات الشحن");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">قيود شركات الشحن</h2><p className="text-sm text-ink-300 mt-1">حدد متى تُرفض طلبات الشحن</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-red-400/15 border border-rose-400/30"><ShieldAlert className="w-5 h-5 text-rose-400" /></span>
            <p className="font-bold text-sm">قيود التوصيل</p>
          </div>
          {[
            { k: "cod", label: "السماح بالدفع عند الاستلام" },
            { k: "fragile", label: "حظر الشحنات الهشة مع بعض الشركات" },
          ].map((r) => (
            <div key={r.k} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
              <span className="text-sm font-semibold">{r.label}</span>
              <button type="button" onClick={() => setForm({ ...form, [r.k as ToggleKey]: !form[r.k as ToggleKey] })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form[r.k as ToggleKey] ? "bg-rose-500" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form[r.k as ToggleKey] ? "right-0.5" : "right-5.5"}`} />
              </button>
            </div>
          ))}
          <label className="block">
            <span className={lbl}>أقصى وزن للشحنة (كجم)</span>
            <input type="number" className={inp} min={1} value={form.maxWeight} onChange={(e) => setForm({ ...form, maxWeight: Number(e.target.value) })} />
          </label>
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
