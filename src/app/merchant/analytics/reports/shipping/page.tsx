"use client";

import { useEffect, useState } from "react";
import { Truck, Loader2 } from "lucide-react";

export default function ShippingReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ byMethod: { key: string; total: number; n: number }[] }>({ byMethod: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=shipping").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const total = data.byMethod.reduce((s, x) => s + x.total, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير الشحن</h2><p className="text-sm text-ink-300 mt-1">تكاليف وأعداد الشحن حسب شركة الشحن</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-cyan-400/15 border border-sky-400/30"><Truck className="w-5 h-5 text-sky-400" /></span>
            <div><p className="font-bold text-sm">حسب شركة الشحن</p><p className="text-[11px] text-ink-300">{total.toLocaleString()} ر.س تكاليف شحن</p></div>
          </div>
          <div className="space-y-3">
            {data.byMethod.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد شحنات مسجلة</p>}
            {data.byMethod.map((m) => (
              <div key={m.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-ink-300" /><span className="text-sm font-semibold">{m.key}</span></div>
                <div className="text-left">
                  <p className="text-sm font-latin font-bold">{m.total.toLocaleString()} ر.س</p>
                  <p className="text-[11px] text-ink-300">{m.n} شحنة</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
