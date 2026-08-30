"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2 } from "lucide-react";

type C = { name: string; email: string; totalSpent: number; orderCount: number };

export default function CartPointsReportPage() {
  const [loaded, setLoaded] = useState(false);
  const [pointsCfg, setPointsCfg] = useState({ pointsPerSar: 1, redeemPts: 100 });
  const [top, setTop] = useState<C[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/merchant/settings").then((r) => r.json()),
      fetch("/api/merchant/customers").then((r) => r.json()),
    ]).then(([set, cu]) => {
      const s = set.store?.settings ?? {};
      setPointsCfg({ pointsPerSar: Number(s.pointsPerSar ?? 1), redeemPts: Number(s.redeemPts ?? 100) });
      setTop((Array.isArray(cu.customers) ? cu.customers : []).slice(0, 10));
    }).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير سلة بوينت</h2><p className="text-sm text-ink-300 mt-1">نقاط الولاء المتراكمة للعملاء</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="glass rounded-3xl p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-400/15 border border-amber-400/30"><Coins className="w-5 h-5 text-amber-400" /></span>
              <div><p className="text-2xl font-bold">{pointsCfg.pointsPerSar} نقطة</p><p className="text-xs text-ink-300">لكل ريال إنفاق</p></div>
            </div>
            <div className="glass rounded-3xl p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Coins className="w-5 h-5 text-emerald-400" /></span>
              <div><p className="text-2xl font-bold">{pointsCfg.redeemPts} نقطة</p><p className="text-xs text-ink-300">لاسترداد الخصم</p></div>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="font-bold text-sm mb-3">النقاط المقدرة حسب الإنفاق</p>
            <div className="space-y-2">
              {top.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا يوجد عملاء</p>}
              {top.map((c, i) => {
                const pts = Math.round(c.totalSpent * pointsCfg.pointsPerSar);
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
                    <span className="text-sm font-semibold truncate pe-2">{c.name}</span>
                    <span className="text-sm font-latin font-bold text-amber-400">{pts.toLocaleString()} نقطة</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
