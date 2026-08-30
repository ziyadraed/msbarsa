"use client";

import { useEffect, useState } from "react";
import { Megaphone, Loader2 } from "lucide-react";

type Coupon = { code: string; type: string; value: number; minOrder: number; used: number; maxUses: number | null; active: boolean };

export default function MarketingReportPage() {
  const [loaded, setLoaded] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    fetch("/api/merchant/coupons").then((r) => r.json()).then((d) => {
      setCoupons(Array.isArray(d.coupons) ? d.coupons : []);
    }).finally(() => setLoaded(true));
  }, []);

  const totalUses = coupons.reduce((s, c) => s + c.used, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تقارير التسويق</h2><p className="text-sm text-ink-300 mt-1">أداء كوبوناتك التسويقية</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-pink-400/15 border border-rose-400/30"><Megaphone className="w-5 h-5 text-rose-400" /></span>
            <div><p className="font-bold text-sm">استخدام الكوبونات</p><p className="text-[11px] text-ink-300">{coupons.length} كوبون · {totalUses} استخدام</p></div>
          </div>
          <div className="space-y-2">
            {coupons.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد كوبونات</p>}
            {coupons.map((c) => (
              <div key={c.code} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-neon-400/15 text-neon-400 font-latin text-xs">{c.code}</span>
                  <span className="text-xs text-ink-300">{c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? `${c.value} ر.س` : "شحن مجاني"}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-latin font-bold">{c.used} {c.maxUses ? `/ ${c.maxUses}` : ""}</p>
                  <p className="text-[11px] text-ink-300">استخدام</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
