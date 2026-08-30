"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "SAR", name: "ريال سعودي", symbol: "ر.س" },
  { code: "AED", name: "درهم إماراتي", symbol: "د.إ" },
  { code: "KWD", name: "دينار كويتي", symbol: "د.ك" },
  { code: "QAR", name: "ريال قطري", symbol: "ر.ق" },
  { code: "BHD", name: "دينار بحريني", symbol: "د.ب" },
  { code: "OMR", name: "ريال عماني", symbol: "ر.ع" },
  { code: "EGP", name: "جنيه مصري", symbol: "ج.م" },
  { code: "USD", name: "دولار أمريكي", symbol: "$" },
];

export default function CurrenciesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState<string[]>(["SAR"]);
  const [defaultCur, setDefaultCur] = useState("SAR");

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.currencies)) setEnabled(s.currencies as string[]);
      if (s.defaultCurrency) setDefaultCur(s.defaultCurrency as string);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { currencies: enabled, defaultCurrency: defaultCur } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات العملات");
    } finally {
      setSaving(false);
    }
  }

  function toggle(code: string) {
    if (code === defaultCur) return toast.error("لا يمكن تعطيل العملة الافتراضية");
    setEnabled((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">العملات</h2>
        <p className="text-sm text-ink-300 mt-1">حدد العملات المتاحة في متجرك وعملتك الافتراضية</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30">
                <Coins className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <p className="font-bold">العملات المتاحة</p>
                <p className="text-[11px] text-ink-300">{enabled.length} عملة مفعّلة · الافتراضية {CURRENCIES.find((c) => c.code === defaultCur)?.symbol}</p>
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {CURRENCIES.map((c) => {
              const on = enabled.includes(c.code);
              const isDefault = defaultCur === c.code;
              return (
                <button key={c.code} onClick={() => { if (!isDefault) toggle(c.code); }} className={`flex items-center gap-3 rounded-2xl border p-3 text-right ${on ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/3 opacity-70"}`}>
                  <span className={`font-latin font-bold text-sm w-12`}>{c.code}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-[11px] text-ink-300 font-latin">{c.symbol}</p>
                  </div>
                  {isDefault && <span className="text-[10px] px-2 py-1 rounded-full bg-neon-400/15 text-neon-400 border border-neon-400/30">افتراضية</span>}
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
