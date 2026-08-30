"use client";

import { useEffect, useState } from "react";
import { PieChart, Loader2 } from "lucide-react";

export default function PreferencesPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ cats: { key: string; n: number }[]; total: number }>({ cats: [], total: 0 });

  useEffect(() => {
    fetch("/api/merchant/reports?type=preferences").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const max = Math.max(1, ...data.cats.map((c) => c.n));

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تفضيلات الشراء</h2><p className="text-sm text-ink-300 mt-1">أي تصنيفات منتجات يشتريها عملاؤك أكثر</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-rose-400/15 border border-pink-400/30"><PieChart className="w-5 h-5 text-pink-400" /></span>
            <div><p className="font-bold text-sm">حسب التصنيف</p><p className="text-[11px] text-ink-300">{data.total} قطعة مباعة</p></div>
          </div>
          <div className="space-y-3">
            {data.cats.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد مبيعات مسجلة</p>}
            {data.cats.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-semibold w-36 truncate">{c.key}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400" style={{ width: `${(c.n / max) * 100}%` }} /></div>
                <span className="text-sm font-latin font-bold w-16 text-left">{c.n}</span>
                <span className="text-[11px] text-ink-300 w-14 text-left">{Math.round((c.n / data.total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
