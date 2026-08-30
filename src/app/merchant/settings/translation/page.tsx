"use client";

import { useEffect, useState } from "react";
import { Languages, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Entry = { key: string; en: string; ar: string };

const DEFAULTS: Entry[] = [
  { key: "nav.home", en: "Home", ar: "الرئيسية" },
  { key: "nav.products", en: "Products", ar: "المنتجات" },
  { key: "nav.about", en: "About Us", ar: "من نحن" },
  { key: "nav.contact", en: "Contact", ar: "تواصل معنا" },
];

export default function TranslationPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState("en");
  const [entries, setEntries] = useState<Entry[]>(DEFAULTS);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.translations)) {
        const stored = s.translations as { key: string; en: string; ar: string }[];
        setEntries(stored.length ? stored : DEFAULTS);
      }
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { translations: entries } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الترجمات");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">الترجمة</h2>
        <p className="text-sm text-ink-300 mt-1">ترجم نصوص متجرك لمحتوى متعدد اللغات</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30">
                <Languages className="w-5 h-5 text-sky-400" />
              </span>
              <div className="flex gap-1">
                {["en", "ar"].map((l) => (
                  <button key={l} onClick={() => setTarget(l)} className={`px-3 py-1 rounded-lg text-xs font-bold ${target === l ? "bg-neon-400/15 text-neon-400" : "text-ink-300"}`}>
                    {l === "en" ? "English" : "العربية"}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>

          <div className="space-y-3">
            {entries.map((e, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-ink-900/40 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-300 font-latin bg-white/5 rounded px-2 py-1">{e.key}</span>
                  <button type="button" onClick={() => setEntries((p) => p.filter((_, j) => j !== i))} className="ms-auto text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="block">
                    <span className={lbl}>English</span>
                    <input className={inp + " font-latin text-left"} value={e.en} onChange={(ev) => setEntries((p) => p.map((x, j) => j === i ? { ...x, en: ev.target.value } : x))} />
                  </label>
                  <label className="block">
                    <span className={lbl}>العربية</span>
                    <input className={inp} value={e.ar} onChange={(ev) => setEntries((p) => p.map((x, j) => j === i ? { ...x, ar: ev.target.value } : x))} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setEntries((p) => [...p, { key: "", en: "", ar: "" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400 hover:border-neon-400/40">
            <Plus className="w-4 h-4" /> إضافة نص
          </button>
        </div>
      )}
    </div>
  );
}
