"use client";

import { useEffect, useState } from "react";
import { FolderPlus, RefreshCw, Pencil, Trash2, Save, X, Loader2, Folder } from "lucide-react";
import { toast } from "sonner";

type Cat = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  status: string;
  productCount: number;
};

export default function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [form, setForm] = useState({ name: "", tagline: "" });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/categories");
      const d = await r.json();
      setCats(d.categories ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", tagline: "" });
    setShowForm(true);
  }
  function openEdit(c: Cat) {
    setEditing(c);
    setForm({ name: c.name, tagline: c.tagline });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? "/api/merchant/categories" : "/api/merchant/categories";
      const r = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الحفظ");
      toast.success(editing ? "تم تحديث القسم" : "تم إنشاء القسم");
      setShowForm(false);
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Cat) {
    if (!confirm(`حذف قسم «${c.name}»؟ لا يمكن الحذف إذا يحتوي منتجات.`)) return;
    try {
      const r = await fetch(`/api/merchant/categories?id=${c.id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الحذف");
      toast.success("تم الحذف");
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">التصنيفات</h2>
          <p className="text-sm text-ink-300 mt-1">نظّم منتجاتك في أقسام — {cats.length} قسم</p>
        </div>
        <button onClick={openNew} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <FolderPlus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Folder className="w-5 h-5 text-neon-400" /> {editing ? "تعديل القسم" : "قسم جديد"}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">اسم القسم *</span>
              <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="مثال: برامج مايكروسوفت" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">وصف مختصر</span>
              <input className="inp" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="وصف يظهر تحت عنوان القسم" />
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm col-span-full">جارٍ التحميل...</div>
        ) : cats.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm col-span-full">لا تصنيفات بعد — أضف أول قسم</div>
        ) : (
          cats.map((c) => (
            <div key={c.id} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-11 h-11 rounded-2xl bg-white/5">
                    <Folder className="w-5 h-5 text-neon-400" />
                  </span>
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-[11px] text-ink-300 font-latin truncate max-w-[150px]">{c.slug}</p>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-full border shrink-0 ${c.status === "active" ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" : "bg-white/5 text-ink-300 border-white/10"}`}>
                  {c.status === "active" ? "نشط" : "موقوف"}
                </span>
              </div>
              {c.tagline && <p className="text-xs text-ink-300 leading-relaxed">{c.tagline}</p>}
              <p className="text-xs text-ink-300 font-latin">{c.productCount} منتج</p>
              <div className="flex gap-2 pt-1 mt-auto">
                <button onClick={() => openEdit(c)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 flex-1 justify-center">
                  <Pencil className="w-3.5 h-3.5" /> تعديل
                </button>
                <button onClick={() => remove(c)} className="rounded-xl px-3 py-2 text-xs font-semibold border border-red-400/30 text-red-300 hover:bg-red-400/10 flex items-center gap-1.5 flex-1 justify-center">
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
