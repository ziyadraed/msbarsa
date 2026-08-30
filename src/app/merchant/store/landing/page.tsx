"use client";

import { useEffect, useState } from "react";
import { Rocket, Plus, Trash2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

type LP = { id: string; title: string; slug: string; headline: string };

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);
  const [pages, setPages] = useState<LP[]>([]);
  const [form, setForm] = useState({ title: "", slug: "", headline: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.landingPages)) setPages(s.landingPages as LP[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function persist(next: LP[]) {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { landingPages: next } }),
      });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "تعذر الحفظ"); return false; }
      return true;
    } catch {
      toast.error("خطأ في الاتصال");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (form.title.trim().length < 2) return toast.error("عنوان الحملة مطلوب");
    const lp: LP = { id: Date.now().toString(36), title: form.title.trim(), slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), headline: form.headline.trim() };
    const next = [...pages, lp];
    const ok = await persist(next);
    if (ok) { setPages(next); setForm({ title: "", slug: "", headline: "" }); toast.success("تم إنشاء صفحة الهبوط"); }
  }

  async function remove(id: string) {
    const next = pages.filter((p) => p.id !== id);
    const ok = await persist(next);
    if (ok) { setPages(next); toast.success("تم الحذف"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">صفحات الهبوط</h2>
        <p className="text-sm text-ink-300 mt-1">صفحات تسويقية منفصلة لحملاتك وإعلاناتك — {pages.length} صفحة</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <form onSubmit={add} className="glass rounded-3xl p-6 space-y-4 self-start">
            <h3 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-neon-400" /> صفحة هبوط جديدة</h3>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">عنوان الحملة *</span>
              <input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الرابط (slug)</span>
              <input className="inp font-latin" dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">العنوان الرئيسي</span>
              <input className="inp" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            </label>
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold w-full flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} إنشاء
            </button>
          </form>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {pages.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">لا صفحات هبوط بعد — أنشئ أول صفحة لحملاتك</div>
            ) : (
              pages.map((p) => (
                <div key={p.id} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift">
                  <div className="flex items-start justify-between">
                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/20 to-viol-500/15 border border-white/10">
                      <Rocket className="w-5 h-5 text-neon-400" />
                    </span>
                    <button onClick={() => remove(p.id)} className="btn-ghost rounded-xl p-2 text-rose-300"><X className="w-4 h-4" /></button>
                  </div>
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs text-ink-300 line-clamp-2">{p.headline}</p>
                  <p className="text-[11px] text-neon-400 font-latin mt-auto">/landing/{p.slug}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
