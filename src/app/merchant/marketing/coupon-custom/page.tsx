"use client";

import { useState } from "react";
import { Ticket, Loader2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export default function CouponCustomPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: 10, minOrder: 0, maxUses: 0, active: true });

  function gen() {
    let code = "";
    for (let i = 0; i < 8; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
    setForm({ ...form, code });
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (form.code.trim().length < 3) return toast.error("أدخل كودًا صحيحًا");
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: form.code, type: form.type, value: Number(form.value), minOrder: Number(form.minOrder), maxUses: form.maxUses > 0 ? Number(form.maxUses) : null, active: form.active }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الإنشاء");
      toast.success(`تم إنشاء كوبون ${form.code}`);
      setForm({ code: "", type: "percent", value: 10, minOrder: 0, maxUses: 0, active: true });
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">إنشاء كوبون مخصص</h2><p className="text-sm text-ink-300 mt-1">أنشئ كود خصم مخصص لجمهور محدد</p></div>
      <form onSubmit={create} className="glass rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/15 border border-neon-400/30"><Ticket className="w-5 h-5 text-neon-400" /></span>
          <p className="font-bold text-sm">بيانات الكوبون</p>
        </div>
        <div>
          <span className={lbl}>كود الخصم</span>
          <div className="flex gap-2">
            <input className={inp + " font-latin text-left uppercase"} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER10" />
            <button type="button" onClick={gen} className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 text-ink-300 hover:text-neon-400"><Wand2 className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className={lbl}>نوع الخصم</span>
            <select className={inp} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="percent">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
              <option value="free_shipping">شحن مجاني</option>
            </select>
          </label>
          <label className="block">
            <span className={lbl}>{form.type === "percent" ? "النسبة (%)" : form.type === "fixed" ? "المبلغ (ر.س)" : "—"}</span>
            <input type="number" className={inp} min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} disabled={form.type === "free_shipping"} />
          </label>
          <label className="block">
            <span className={lbl}>الحد الأدنى للطلب</span>
            <input type="number" className={inp} min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className={lbl}>الحد الأقصى للاستخدام (0 = غير محدود)</span>
            <input type="number" className={inp} min={0} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} />
          </label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} إنشاء الكوبون
        </button>
      </form>
    </div>
  );
}
