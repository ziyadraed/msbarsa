"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SeoPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", keywords: "", ogImage: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) {
        const s = d.store.settings ?? {};
        setForm({
          title: String(s.seoTitle ?? ""),
          description: String(s.seoDesc ?? ""),
          keywords: String(s.seoKeywords ?? ""),
          ogImage: String(s.ogImage ?? ""),
        });
      }
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "مسبار",
          design: {
            seoTitle: form.title,
            seoDesc: form.description,
            seoKeywords: form.keywords,
            ogImage: form.ogImage,
          },
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات SEO");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">تحسين محركات البحث (SEO)</h2>
        <p className="text-sm text-ink-300 mt-1">حسّن ظهور متجرك في نتائج البحث</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30">
              <Search className="w-5 h-5 text-neon-400" />
            </span>
            <p className="font-bold">الظهور في البحث</p>
          </div>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">عنوان الصفحة الرئيسية (Title)</span>
            <input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مسبار — متجر التراخيص الرقمية الأصلية" />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">الوصف (Meta Description)</span>
            <textarea className="inp" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">الكلمات المفتاحية (افصل بفواصل)</span>
            <input className="inp" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="تراخيص، ويندوز، أوفيس، أدوبي" />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">صورة المشاركة (OG Image URL)</span>
            <input className="inp font-latin" value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="https://.../share.png" />
          </label>
          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ إعدادات SEO
          </button>
        </form>
      )}
    </div>
  );
}
