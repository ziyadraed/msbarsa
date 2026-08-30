"use client";

import { useEffect, useState } from "react";
import { Gift, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SpecialOfferPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, title: "", type: "percent", value: 0, product: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({ enabled: s.specialOfferEnabled === true, title: String(s.specialOfferTitle ?? ""), type: String(s.specialOfferType ?? "percent"), value: Number(s.specialOfferValue ?? 0), product: String(s.specialOfferProduct ?? "") });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { specialOfferEnabled: form.enabled, specialOfferTitle: form.title, specialOfferType: form.type, specialOfferValue: Number(form.value), specialOfferProduct: form.product } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ العرض الترويجي الخاص");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50 disabled:opacity-50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">إضافة عرض ترويجي خاص</h2><p className="text-sm text-ink-300 mt-1">عرض مميز على منتج محدد</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Gift className="w-5 h-5 text-emerald-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل العرض الخاص</p><p className="text-[11px] text-ink-300">عرض متميز على منتج</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-emerald-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <label className="block">
            <span className={lbl}>عنوان العرض</span>
            <input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} disabled={!form.enabled} />
          </label>
          <label className="block">
            <span className={lbl}>المنتج</span>
            <input className={inp} value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} disabled={!form.enabled} placeholder="اسم المنتج أو رابط" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={lbl}>نوع الخصم</span>
              <select className={inp} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={!form.enabled}>
                <option value="percent">نسبة</option><option value="fixed">مبلغ</option>
              </select>
            </label>
            <label className="block">
              <span className={lbl}>{form.type === "percent" ? "النسبة (%)" : "المبلغ (ر.س)"}</span>
              <input type="number" className={inp} min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} disabled={!form.enabled} />
            </label>
          </div>
          <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
