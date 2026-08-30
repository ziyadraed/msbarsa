"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";

type C = { name: string; email: string; totalSpent: number; orderCount: number; tags: string[] };

export default function LoyaltyReportPage() {
  const [loaded, setLoaded] = useState(false);
  const [repeat, setRepeat] = useState<C[]>([]);

  useEffect(() => {
    fetch("/api/merchant/customers").then((r) => r.json()).then((d) => {
      const all = (Array.isArray(d.customers) ? d.customers : []) as C[];
      setRepeat(all.filter((c) => c.orderCount >= 2).sort((a, b) => b.orderCount - a.orderCount).slice(0, 15));
    }).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير الولاء</h2><p className="text-sm text-ink-300 mt-1">أكثر العملاء ولاءً ومشاركة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-400/15 border border-amber-400/30"><Star className="w-5 h-5 text-amber-400" /></span>
            <div><p className="font-bold text-sm">العملاء المكررون</p><p className="text-[11px] text-ink-300">{repeat.length} عميل ولاء</p></div>
          </div>
          <div className="space-y-2">
            {repeat.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا يوجد عملاء ولاء بعد</p>}
            {repeat.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-amber-400/15 text-amber-400 shrink-0"><Star className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{c.name}</p><p className="text-[11px] text-ink-300 truncate font-latin">{c.email}</p></div>
                <span className="text-xs text-ink-300 shrink-0">{c.orderCount} طلبات</span>
                <span className="text-sm font-latin font-bold shrink-0">{c.totalSpent.toLocaleString()} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
