"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Plus, RefreshCw, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Brand = { id: string; slug: string; name: string; logo: string; productCount: number };

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", logo: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/brands");
      const d = await r.json();
      setBrands(d.brands ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function openNew() { setEditing(null); setForm({ name: "", logo: "" }); setShowForm(true); }
  function openEdit(b: Brand) { setEditing(b); setForm({ name: b.name, logo: b.logo }); setShowForm(true); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("اسم الماركة مطلوب");
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/brands", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الحفظ");
      toast.success(editing ? "تم تحديث الماركة" : "تم إنشاء الماركة");
      setEditing(null);
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: Brand) {
    if (!confirm(`حذف ماركة «${b.name}»؟`)) return;
    const r = await fetch(`/api/merchant/brands?id=${b.id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "فشل الحذف");
    toast.success("تم الحذف");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الماركات والعلامات التجارية</h2>
          <p className="text-sm text-ink-300 mt-1">أدر ماركات منتجاتك وحسّن ظهورها — {brands.length} ماركة</p>
        </div>
        <button onClick={openNew} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة ماركة
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-4 ring-1 ring-neon-400/20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-neon-400" /> {editing ? "تعديل الماركة" : "ماركة جديدة"}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">اسم الماركة *</span>
              <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">شعار الماركة (رابط)</span>
              <input className="inp font-latin" dir="ltr" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-2xl px-6 py-3 text-sm font-semibold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm col-span-full">جارٍ التحميل...</div>
        ) : brands.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">لا ماركات بعد — أضف أول ماركة</div>
        ) : (
          brands.map((b) => (
            <div key={b.id} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift">
              <div className="flex items-start justify-between">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-white/5"><BadgeCheck className="w-5 h-5 text-neon-400" /></span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10">{b.productCount} منتج</span>
              </div>
              <p className="font-bold">{b.name}</p>
              <p className="text-[11px] text-ink-300 font-latin">/{b.slug}</p>
              <div className="flex gap-2 mt-auto pt-1">
                <button onClick={() => openEdit(b)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 flex-1 justify-center">
                  <Pencil className="w-3.5 h-3.5" /> تعديل
                </button>
                <button onClick={() => remove(b)} className="rounded-xl px-3 py-2 text-xs font-semibold border border-red-400/30 text-red-300 hover:bg-red-400/10 flex items-center gap-1.5 flex-1 justify-center">
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
