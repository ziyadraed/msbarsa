"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Page = { slug: string; title: string; content: string };

export default function StorePagesPage() {
  const [loaded, setLoaded] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.pages)) setPages(s.pages as Page[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function persist(next: Page[]) {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { pages: next } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      return true;
    } catch {
      toast.error("خطأ في الاتصال");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm({ title: "", slug: "", content: "" });
  }
  function openEdit(p: Page) {
    setEditing(p);
    setForm(p);
  }

  async function savePage(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (title.length < 2) return toast.error("عنوان الصفحة مطلوب");
    let slug = form.slug.trim();
    if (!slug) slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (editing) {
      const next = pages.map((p) => (p.slug === editing.slug ? { ...p, title, slug, content: form.content } : p));
      const ok = await persist(next);
      if (ok) { setPages(next); setEditing(null); toast.success("تم تحديث الصفحة"); }
    } else {
      if (pages.some((p) => p.slug === slug)) return toast.error("هذا الرابط مستخدم");
      const next = [...pages, { slug, title, content: form.content }];
      const ok = await persist(next);
      if (ok) { setPages(next); setEditing(null); toast.success("تم إنشاء الصفحة"); }
    }
  }

  async function removePage(p: Page) {
    if (!confirm(`حذف صفحة «${p.title}»؟`)) return;
    const next = pages.filter((x) => x.slug !== p.slug);
    const ok = await persist(next);
    if (ok) { setPages(next); toast.success("تم الحذف"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الصفحات التعريفية</h2>
          <p className="text-sm text-ink-300 mt-1">صفحات ثابتة تظهر في متجرك (من نحن، الشروط، الأسئلة...)</p>
        </div>
        <button onClick={openNew} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> صفحة جديدة
        </button>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
      ) : (
        <>
          {(editing || form.title) && !editing && (
            <form onSubmit={savePage} className="glass rounded-3xl p-6 space-y-4 ring-1 ring-neon-400/20">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-neon-400" /> صفحة جديدة</h3>
                <button type="button" onClick={openNew} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
              </div>
              <PageForm form={form} setForm={setForm} saving={saving} />
            </form>
          )}

          {editing && (
            <form onSubmit={savePage} className="glass rounded-3xl p-6 space-y-4 ring-1 ring-neon-400/20">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><Pencil className="w-5 h-5 text-neon-400" /> تعديل: {editing.title}</h3>
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
              </div>
              <PageForm form={form} setForm={setForm} saving={saving} />
            </form>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">لا صفحات بعد — أنشئ أول صفحة</div>
            ) : (
              pages.map((p) => (
                <div key={p.slug} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5"><FileText className="w-5 h-5 text-neon-400" /></span>
                      <div>
                        <p className="font-bold text-sm">{p.title}</p>
                        <p className="text-[11px] text-ink-300 font-latin">/{p.slug}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-ink-300 leading-relaxed line-clamp-2">{p.content}</p>
                  <div className="flex gap-2 mt-auto pt-1">
                    <button onClick={() => openEdit(p)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 flex-1 justify-center">
                      <Pencil className="w-3.5 h-3.5" /> تعديل
                    </button>
                    <button onClick={() => removePage(p)} className="rounded-xl px-3 py-2 text-xs font-semibold border border-red-400/30 text-red-300 hover:bg-red-400/10 flex items-center gap-1.5 flex-1 justify-center">
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PageForm({ form, setForm, saving }: { form: Page; setForm: (p: Page) => void; saving: boolean }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs text-ink-300 mb-1.5">عنوان الصفحة *</span>
          <input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label className="block">
          <span className="block text-xs text-ink-300 mb-1.5">الرابط (slug)</span>
          <input className="inp font-latin" dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about" />
        </label>
      </div>
      <label className="block">
        <span className="block text-xs text-ink-300 mb-1.5">المحتوى</span>
        <textarea className="inp !h-32" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </label>
      <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الصفحة
      </button>
    </>
  );
}
