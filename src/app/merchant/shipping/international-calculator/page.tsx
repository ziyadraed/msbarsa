"use client";

import { useState } from "react";
import { Calculator, Loader2 } from "lucide-react";

export default function IntlCalculatorPage() {
  const [weight, setWeight] = useState(1);
  const [country, setCountry] = useState("الإمارات");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const RATES: Record<string, number> = {
    "الإمارات": 45, "الكويت": 50, "قطر": 55, "البحرين": 40, "عمان": 60, "الأردن": 80,
  };

  function calc() {
    setCalculating(true);
    setTimeout(() => {
      const base = RATES[country] ?? 90;
      const cost = base + Math.max(0, (weight - 1) * 15);
      setResult(Math.round(cost));
      setCalculating(false);
    }, 500);
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">حاسبة الشحن الدولي</h2><p className="text-sm text-ink-300 mt-1">قدّر تكلفة الشحن للدول الخارجية</p></div>
      <div className="glass rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><Calculator className="w-5 h-5 text-sky-400" /></span>
          <div><p className="font-bold text-sm">تقدير فوري</p><p className="text-[11px] text-ink-300">بناءً على الوزن والوجهة</p></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className={lbl}>الوزن (كجم)</span>
            <input type="number" className={inp} min={0.1} step={0.1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className={lbl}>الدولة</span>
            <select className={inp} value={country} onChange={(e) => setCountry(e.target.value)}>
              {Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <button onClick={calc} disabled={calculating} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
          {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} احسب التكلفة
        </button>
        {result !== null && (
          <div className="rounded-2xl border border-neon-400/30 bg-neon-400/10 p-4 text-center">
            <p className="text-[11px] text-ink-300">التكلفة التقديرية إلى {country}</p>
            <p className="text-3xl font-black text-neon-400">{result} ر.س</p>
          </div>
        )}
      </div>
    </div>
  );
}
