"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Tag, Trash2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxUses: number | null;
  used: number;
  active: boolean;
};

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", minOrder: "0", maxUses: "" });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/coupons");
      const d = await r.json();
      setCoupons(d.coupons ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, value: Number(form.value), minOrder: Number(form.minOrder), maxUses: form.maxUses ? Number(form.maxUses) : undefined }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم إنشاء الكوبون");
      setShowForm(false);
      setForm({ code: "", type: "percent", value: "", minOrder: "0", maxUses: "" });
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا الكوبون؟")) return;
    const r = await fetch(`/api/merchant/coupons?id=${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("تم الحذف");
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">التسويق والكوبونات</h2>
          <p className="text-sm text-ink-300 mt-1">أنشئ كوبونات خصم لزيادة المبيعات</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> كوبون جديد
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2"><Tag className="w-5 h-5 text-neon-400" /> كوبون خصم جديد</h3>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الكود *</span>
              <input className="inp font-latin" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="WELCOME10" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">النوع</span>
              <select className="inp" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percent">نسبة مئوية</option>
                <option value="fixed">مبلغ ثابت</option>
                <option value="free_shipping">شحن مجاني</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">{form.type === "percent" ? "النسبة (%)" : form.type === "fixed" ? "المبلغ (ر.س)" : "—"} *</span>
              <input className="inp" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required min="1" disabled={form.type === "free_shipping"} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">حد أدنى للطلب (ر.س)</span>
              <input className="inp" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">أقصى عدد استخدام (اختياري)</span>
              <input className="inp" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="غير محدود" />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-2xl px-6 py-3 text-sm font-semibold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="glass rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <p className="text-xs text-ink-300">الكوبونات ({coupons.length})</p>
          <button onClick={load} className="btn-ghost rounded-xl p-2"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا كوبونات بعد — أنشئ أول كوبون</div>
        ) : (
          <div className="divide-y divide-white/5">
            {coupons.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0">
                  <Tag className="w-5 h-5 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-latin font-bold text-sm">{c.code}</p>
                  <p className="text-[11px] text-ink-300">
                    {c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? `${c.value} ر.س` : "شحن مجاني"}
                    {c.minOrder > 0 && ` · حد أدنى ${c.minOrder} ر.س`}
                    {c.maxUses ? ` · استخدم ${c.used}/${c.maxUses}` : ` · استخدم ${c.used}`}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${c.active ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-white/5 text-ink-300 border-white/10"}`}>
                  {c.active ? "مفعّل" : "معطّل"}
                </span>
                <button onClick={() => remove(c.id)} className="btn-ghost rounded-xl p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
