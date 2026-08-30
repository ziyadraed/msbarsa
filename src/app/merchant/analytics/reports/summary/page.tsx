"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Loader2, Wallet, ShoppingBag, Users, Package, TrendingUp } from "lucide-react";

export default function SummaryReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ revenue: number; orders: number; customers: number; products: number; aov: number; byDay: { d: string; total: number }[] }>({ revenue: 0, orders: 0, customers: 0, products: 0, aov: 0, byDay: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=summary").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const max = Math.max(1, ...data.byDay.map((x) => x.total));

  const cards = [
    { icon: Wallet, label: "الإيرادات", value: data.revenue.toLocaleString() + " ر.س", color: "text-emerald-400", bg: "from-emerald-500/25 to-teal-400/15 border-emerald-400/30" },
    { icon: ShoppingBag, label: "الطلبات", value: String(data.orders), color: "text-sky-400", bg: "from-sky-500/25 to-blue-400/15 border-sky-400/30" },
    { icon: Users, label: "العملاء", value: String(data.customers), color: "text-viol-400", bg: "from-viol-500/25 to-purple-400/15 border-viol-400/30" },
    { icon: Package, label: "المنتجات", value: String(data.products), color: "text-amber-400", bg: "from-amber-500/25 to-yellow-400/15 border-amber-400/30" },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">ملخص أداء المتجر</h2><p className="text-sm text-ink-300 mt-1">نظرة شاملة على أداء متجرك من بيانات حقيقية</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((c) => (
              <div key={c.label} className={`glass rounded-3xl p-5 ${c.bg}`}>
                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 border border-white/10 mb-3"><c.icon className={`w-5 h-5 ${c.color}`} /></span>
                <p className="text-2xl font-black">{c.value}</p>
                <p className="text-[11px] text-ink-300 mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="glass rounded-3xl p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-400/15 border border-teal-400/30"><TrendingUp className="w-5 h-5 text-teal-400" /></span>
              <div><p className="text-2xl font-bold">{data.aov.toLocaleString()} ر.س</p><p className="text-xs text-ink-300">متوسط قيمة الطلب</p></div>
            </div>
            <div className="glass rounded-3xl p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/15 border border-neon-400/30"><LayoutDashboard className="w-5 h-5 text-neon-400" /></span>
              <div><p className="text-2xl font-bold">{data.byDay.length}</p><p className="text-xs text-ink-300">أيام بأداء خلال 14 يومًا</p></div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <p className="font-bold text-sm mb-4">المبيعات — آخر 14 يومًا</p>
            {data.byDay.length === 0 ? (
              <p className="text-xs text-ink-300/60 text-center py-6">لا توجد مبيعات في هذه الفترة</p>
            ) : (
              <div className="flex items-end gap-1.5 h-40">
                {data.byDay.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-viol-500/40 to-neon-400/70 transition-all" style={{ height: `${Math.max(4, (d.total / max) * 100)}%` }} title={`${d.total} ر.س`} />
                    <span className="text-[9px] text-ink-300 font-latin">{d.d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
