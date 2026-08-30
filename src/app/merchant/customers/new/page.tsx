"use client";

import { useState } from "react";
import { UserPlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function NewCustomerPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", note: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error("الاسم والبريد مطلوبان");
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/customers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, city: form.city, notes: form.note }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الإنشاء");
      toast.success("تم إنشاء العميل");
      setForm({ name: "", email: "", phone: "", city: "", note: "" });
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">إنشاء عميل جديد</h2><p className="text-sm text-ink-300 mt-1">أضف عميلًا يدويًا إلى قاعدة عملائك</p></div>
      <form onSubmit={create} className="glass rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/15 border border-neon-400/30"><UserPlus className="w-5 h-5 text-neon-400" /></span>
          <p className="font-bold text-sm">بيانات العميل</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className={lbl}>الاسم</span>
            <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم العميل" />
          </label>
          <label className="block">
            <span className={lbl}>البريد الإلكتروني</span>
            <input className={inp + " font-latin text-left"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@email.com" />
          </label>
          <label className="block">
            <span className={lbl}>الجوال</span>
            <input className={inp + " font-latin text-left"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" />
          </label>
          <label className="block">
            <span className={lbl}>المدينة</span>
            <input className={inp} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="جدة" />
          </label>
          <label className="block sm:col-span-2">
            <span className={lbl}>ملاحظات</span>
            <textarea className={inp} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} إنشاء العميل
        </button>
      </form>
    </div>
  );
}
