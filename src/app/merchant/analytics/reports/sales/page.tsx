"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Loader2, Wallet, Hash } from "lucide-react";

export default function SalesReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ byPayment: { key: string; total: number; n: number }[]; byStatus: { key: string; total: number; n: number }[] }>({ byPayment: [], byStatus: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=sales").then((r) => r.json()).then((d) => { setData(d); }).finally(() => setLoaded(true));
  }, []);

  const totalPay = data.byPayment.reduce((s, x) => s + x.total, 0);
  const maxPay = Math.max(1, ...data.byPayment.map((x) => x.total));

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير المبيعات</h2><p className="text-sm text-ink-300 mt-1">إيراداتك حسب طريقة الدفع والحالة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><TrendingUp className="w-5 h-5 text-emerald-400" /></span>
              <div><p className="font-bold text-sm">حسب طريقة الدفع</p><p className="text-[11px] text-ink-300">إجمالي {totalPay.toLocaleString()} ر.س</p></div>
            </div>
            <div className="space-y-3">
              {data.byPayment.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد مبيعات مسجلة بعد</p>}
              {data.byPayment.map((p) => (
                <div key={p.key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-32"><Wallet className="w-4 h-4 text-ink-300" /><span className="text-sm font-semibold">{p.key}</span></div>
                  <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${(p.total / maxPay) * 100}%` }} /></div>
                  <span className="text-sm font-latin font-bold w-28 text-left">{p.total.toLocaleString()} ر.س</span>
                  <span className="text-[11px] text-ink-300 w-16 text-left"><Hash className="inline w-3 h-3" />{p.n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="font-bold text-sm mb-4">حسب حالة الطلب</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.byStatus.map((s) => (
                <div key={s.key} className="rounded-2xl border border-white/10 bg-ink-900/40 p-4">
                  <p className="text-[11px] text-ink-300">{s.key}</p>
                  <p className="text-xl font-bold mt-1">{s.total.toLocaleString()} ر.س</p>
                  <p className="text-[11px] text-ink-300 mt-0.5">{s.n} طلب</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
