"use client";

import { useEffect, useState } from "react";
import { Languages, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

const LANGS = [
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
];

export default function LanguagesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState<string[]>(["ar"]);
  const [defaultLang, setDefaultLang] = useState("ar");

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.languages)) setEnabled(s.languages as string[]);
      if (s.defaultLanguage) setDefaultLang(s.defaultLanguage as string);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { languages: enabled, defaultLanguage: defaultLang } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات اللغات");
    } finally {
      setSaving(false);
    }
  }

  function toggle(code: string) {
    if (code === defaultLang) return toast.error("لا يمكن تعطيل اللغة الافتراضية");
    setEnabled((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">لغات المتجر</h2>
        <p className="text-sm text-ink-300 mt-1">حدد لغات عرض متجرك للوصول لجمهور أوسع</p>
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
              <div>
                <p className="font-bold">اللغات المتاحة</p>
                <p className="text-[11px] text-ink-300">{enabled.length} لغة مفعّلة</p>
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {LANGS.map((l) => {
              const on = enabled.includes(l.code);
              const isDefault = defaultLang === l.code;
              return (
                <button key={l.code} onClick={() => { if (!isDefault) toggle(l.code); }} className={`flex items-center gap-3 rounded-2xl border p-3 text-right ${on ? "border-sky-400/40 bg-sky-400/10" : "border-white/10 bg-white/3 opacity-70"}`}>
                  <span className="text-lg">{l.flag}</span>
                  <span className="flex-1 text-sm font-semibold">{l.name}</span>
                  {isDefault && <span className="text-[10px] px-2 py-1 rounded-full bg-neon-400/15 text-neon-400 border border-neon-400/30">الافتراضية</span>}
                  {on && !isDefault && <span className="text-emerald-400"><Check className="w-4 h-4" /></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
