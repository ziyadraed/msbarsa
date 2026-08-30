"use client";

import { useEffect, useState } from "react";
import { Boxes, Loader2, AlertTriangle } from "lucide-react";

export default function InventoryReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ low: { name: string; stock: number }[] }>({ low: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=inventory").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير المخزون</h2><p className="text-sm text-ink-300 mt-1">المنتجات الأقل توفرًا للتنبيه بمواعيد إعادة الطلب</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-400/15 border border-amber-400/30"><Boxes className="w-5 h-5 text-amber-400" /></span>
            <div><p className="font-bold text-sm">مستويات المخزون</p><p className="text-[11px] text-ink-300">من بيانات المنتجات الفعلية</p></div>
          </div>
          <div className="space-y-2">
            {data.low.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد منتجات مسجلة</p>}
            {data.low.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <span className={`grid place-items-center w-8 h-8 rounded-lg ${p.stock <= 0 ? "bg-red-400/15 text-red-400" : p.stock < 10 ? "bg-amber-400/15 text-amber-400" : "bg-white/5 text-ink-300"}`}>
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <p className="flex-1 text-sm font-semibold truncate">{p.name}</p>
                <span className={`text-sm font-latin font-bold ${p.stock <= 0 ? "text-red-400" : p.stock < 10 ? "text-amber-400" : "text-ink-100"}`}>{p.stock}</span>
                <span className="text-[11px] text-ink-300 w-16 text-left">قطعة</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
