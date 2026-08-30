"use client";

import { useEffect, useState } from "react";
import { Palette, Loader2, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

const THEMES = [
  { id: "raed", name: "رائد", desc: "ثيم سلة الكلاسيكي — تصميم نظيف وجذاب", tag: "مستوحى من سلة", tint: "from-neon-500/25 to-cyan-400/15 border-neon-400/30" },
  { id: "mawj", name: "موج", desc: "ألوان هادئة بلمسة زرقاء مائية", tag: "", tint: "from-sky-500/25 to-blue-400/15 border-sky-400/30" },
  { id: "layl", name: "ليل", desc: "ثيم داكن فاخر لمتجر متميز", tag: "داكن", tint: "from-viol-500/25 to-indigo-400/15 border-viol-400/30" },
  { id: "shams", name: "شمس", desc: "ألوان دافئة ومشرقة تجذب الانتباه", tag: "مشرق", tint: "from-amber-500/25 to-orange-400/15 border-amber-400/30" },
];

export default function ThemesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState("raed");

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) setTheme(String(d.store.settings?.theme ?? "raed"));
    }).finally(() => setLoaded(true));
  }, []);

  async function select(t: string) {
    setTheme(t);
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { theme: t } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم تطبيق الثيم");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">ثيمات المتجر</h2>
          <p className="text-sm text-ink-300 mt-1">اختر هوية بصرية تناسب متجرك</p>
        </div>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => select(t.id)}
                disabled={saving}
                className={`relative glass rounded-3xl p-5 text-right hover-lift ${active ? "ring-2 ring-neon-400/60" : ""}`}
              >
                {active && (
                  <span className="absolute top-3 end-3 grid place-items-center w-7 h-7 rounded-full bg-neon-500 text-ink-950">
                    <Check className="w-4 h-4" />
                  </span>
                )}
                <span className={`grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br border mb-4 ${t.tint}`}>
                  <Palette className="w-6 h-6" />
                </span>
                <p className="font-bold flex items-center gap-2">{t.name} {t.tag && <span className="text-[9px] px-2 py-0.5 rounded-full bg-neon-400/15 text-neon-400 border border-neon-400/25">{t.tag}</span>}</p>
                <p className="text-xs text-ink-300 mt-2 leading-relaxed">{t.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-sm text-ink-300 leading-7 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-neon-400 shrink-0" />
        سيُطبَّق الثيم المحدد على الواجهة الأمامية لمتجرك. يمكنك التبديل بين الثيمات في أي وقت.
      </div>
    </div>
  );
}
