"use client";

import { useEffect, useState } from "react";
import { Package, Loader2, Trophy } from "lucide-react";

export default function ProductReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ top: { name: string; category: string; qty: number; revenue: number }[] }>({ top: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=products").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const max = Math.max(1, ...data.top.map((p) => p.revenue));

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير المنتجات</h2><p className="text-sm text-ink-300 mt-1">الأعلى إيرادًا ومبيعاتً</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><Package className="w-5 h-5 text-sky-400" /></span>
            <div><p className="font-bold text-sm">أفضل 10 منتجات</p><p className="text-[11px] text-ink-300">من بيانات الطلبات الفعلية</p></div>
          </div>
          <div className="space-y-3">
            {data.top.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد مبيعات مسجلة بعد</p>}
            {data.top.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`grid place-items-center w-7 h-7 rounded-lg text-[11px] font-bold shrink-0 ${i < 3 ? "bg-amber-400/15 text-amber-400 border border-amber-400/30" : "bg-white/5 text-ink-300"}`}>
                  {i < 3 ? <Trophy className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400" style={{ width: `${(p.revenue / max) * 100}%` }} /></div>
                    <span className="text-[11px] text-ink-300">{p.category}</span>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-sm font-latin font-bold">{p.revenue.toLocaleString()} ر.س</p>
                  <p className="text-[11px] text-ink-300">× {p.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
