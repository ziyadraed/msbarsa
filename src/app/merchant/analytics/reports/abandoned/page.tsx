"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Loader2, Clock } from "lucide-react";

export default function AbandonedPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ items: { id: string; orderNumber: string; customerName: string; total: number; createdAt: string }[]; count: number }>({ items: [], count: 0 });

  useEffect(() => {
    fetch("/api/merchant/reports?type=abandoned").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير السلات المتروكة</h2><p className="text-sm text-ink-300 mt-1">طلبات غير مكتملة قابلة للاسترجاع</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/25 to-orange-400/15 border border-red-400/30"><ShoppingCart className="w-5 h-5 text-red-400" /></span>
            <div><p className="font-bold text-sm">{data.count} سلة متروكة</p><p className="text-[11px] text-ink-300">طلبات بحالة معلّقة/غير مدفوعة</p></div>
          </div>
          <div className="space-y-2">
            {data.items.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد سلات متروكة</p>}
            {data.items.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-red-400/15 text-red-400"><Clock className="w-4 h-4" /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{o.customerName}</p>
                  <p className="text-[11px] text-ink-300 font-latin">#{o.orderNumber}</p>
                </div>
                <span className="text-sm font-latin font-bold">{o.total.toLocaleString()} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
