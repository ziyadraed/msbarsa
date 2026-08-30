"use client";

import { useEffect, useState } from "react";
import { Palette, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const ACCENTS = [
  { name: "سماوي", value: "#22d3ee" },
  { name: "بنفسجي", value: "#8b5cf6" },
  { name: "زمردي", value: "#34d399" },
  { name: "ذهبي", value: "#fbbf24" },
  { name: "وردي", value: "#f472b6" },
  { name: "برتقالي", value: "#fb923c" },
];

export default function StoreDesignPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tagline: "",
    logo: "",
    accent: "#22d3ee",
    announcement: "",
  });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) {
        const s = d.store.settings ?? {};
        setForm({
          tagline: String(s.tagline ?? ""),
          logo: String(d.store.logo ?? ""),
          accent: String(s.accent ?? "#22d3ee"),
          announcement: String(s.announcement ?? ""),
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
          name: "مسبار", // keep name; full store info lives in settings page
          design: {
            tagline: form.tagline,
            accent: form.accent,
            announcement: form.announcement,
          },
          logo: form.logo,
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ تصميم المتجر");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">تصميم المتجر</h2>
        <p className="text-sm text-ink-300 mt-1">خصّص مظهر متجرك وشعاره ولونه المميز</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30">
              <Palette className="w-5 h-5 text-neon-400" />
            </span>
            <p className="font-bold">الهوية البصرية</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الشعار (رابط الصورة)</span>
              <input className="inp font-latin" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://.../logo.png" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الشعار التسويقي (Tagline)</span>
              <input className="inp" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="منصتك الأولى للبرمجيات المرخصة" />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs text-ink-300 mb-2">اللون المميز</span>
            <div className="flex flex-wrap gap-3">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setForm({ ...form, accent: a.value })}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold border ${form.accent === a.value ? "border-white/40 bg-white/5" : "border-white/10 bg-white/2 hover:bg-white/5"}`}
                >
                  <span className="w-5 h-5 rounded-full border border-white/20" style={{ background: a.value }} />
                  {a.name}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">إعلان أعلى المتجر</span>
            <input className="inp" value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} placeholder="توصيل فوري للمنتجات الرقمية 🚀" />
          </label>

          {/* Live accent preview */}
          <div className="rounded-2xl border border-white/10 p-4 bg-ink-900/40">
            <p className="text-xs text-ink-300 mb-2">معاينة اللون</p>
            <button className="rounded-xl px-5 py-2.5 text-sm font-bold text-ink-950" style={{ background: form.accent }}>
              زر باللون المميز
            </button>
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التصميم
          </button>
        </form>
      )}
    </div>
  );
}
