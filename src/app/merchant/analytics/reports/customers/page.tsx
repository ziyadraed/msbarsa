"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, Repeat, Crown } from "lucide-react";

export default function CustomerReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ top: { name: string; email: string; totalSpent: number; orders: number }[]; repeat: number }>({ top: [], repeat: 0 });

  useEffect(() => {
    fetch("/api/merchant/reports?type=customers").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const max = Math.max(1, ...data.top.map((c) => c.totalSpent ?? 0));

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير العملاء</h2><p className="text-sm text-ink-300 mt-1">أفضل العملاء قيمةً والأكثر ولاءً</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="glass rounded-3xl p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><Repeat className="w-5 h-5 text-viol-400" /></span>
              <div><p className="text-2xl font-bold">{data.repeat}</p><p className="text-xs text-ink-300">عملاء مكررون (أكثر من طلب)</p></div>
            </div>
            <div className="glass rounded-3xl p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-400/15 border border-amber-400/30"><Crown className="w-5 h-5 text-amber-400" /></span>
              <div><p className="text-2xl font-bold">{data.top.length}</p><p className="text-xs text-ink-300">أفضل العملاء</p></div>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><Users className="w-5 h-5 text-viol-400" /></span>
              <p className="font-bold text-sm">أفضل 10 عملاء</p>
            </div>
            <div className="space-y-3">
              {data.top.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا يوجد عملاء مسجلون بعد</p>}
              {data.top.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-lg text-[11px] font-bold bg-white/5 text-ink-300 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-[11px] text-ink-300 truncate font-latin">{c.email}</p>
                  </div>
                  <div className="flex-1 hidden sm:block h-2 rounded-full bg-white/5 overflow-hidden max-w-40"><div className="h-full rounded-full bg-gradient-to-r from-viol-500 to-purple-400" style={{ width: `${((c.totalSpent ?? 0) / max) * 100}%` }} /></div>
                  <div className="text-left shrink-0">
                    <p className="text-sm font-latin font-bold">{c.totalSpent?.toLocaleString() ?? 0} ر.س</p>
                    <p className="text-[11px] text-ink-300">{c.orders} طلب</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
