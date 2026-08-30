"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export default function PaymentReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ byMethod: { key: string; total: number; n: number }[] }>({ byMethod: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=payments").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const total = data.byMethod.reduce((s, x) => s + x.total, 0);
  const max = Math.max(1, ...data.byMethod.map((x) => x.total));

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير الدفع</h2><p className="text-sm text-ink-300 mt-1">إيراداتك حسب وسيلة الدفع</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><CreditCard className="w-5 h-5 text-emerald-400" /></span>
            <div><p className="font-bold text-sm">حسب طريقة الدفع</p><p className="text-[11px] text-ink-300">{total.toLocaleString()} ر.س إجمالًا</p></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.byMethod.length === 0 && <p className="text-xs text-ink-300/60 col-span-full text-center py-4">لا توجد مدفوعات مسجلة</p>}
            {data.byMethod.map((m) => (
              <div key={m.key} className="rounded-2xl border border-white/10 bg-ink-900/40 p-4">
                <p className="text-sm font-bold">{m.key}</p>
                <div className="mt-2 h-2.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${(m.total / max) * 100}%` }} /></div>
                <p className="mt-2 text-lg font-latin font-bold">{m.total.toLocaleString()} ر.س</p>
                <p className="text-[11px] text-ink-300">{m.n} معاملة</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
