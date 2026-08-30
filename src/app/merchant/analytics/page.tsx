"use client";

import { useEffect, useState } from "react";
import { Wallet, ShoppingBag, Users, TrendingUp, BarChart3, Loader2 } from "lucide-react";

type Analytics = {
  summary: { revenue: number; orders: number; aov: number; customers: number; products: number };
  topProducts: { name: string; qty: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; revenue: number; qty: number }[];
};

const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "بانتظار الدفع", paid: "مدفوع", processing: "قيد التجهيز", ready: "جاهز",
  shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/merchant/analytics").then((r) => r.json()).then((d) => setData(d)).catch(() => setData(null));
  }, []);

  if (!data) {
    return <div className="glass rounded-3xl p-14 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل التحليلات...</div>;
  }

  const cards = [
    { label: "الإيرادات", value: `${data.summary.revenue} ر.س`, icon: Wallet, tint: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
    { label: "الطلبات", value: String(data.summary.orders), icon: ShoppingBag, tint: "text-neon-400 bg-neon-400/10 border-neon-400/25" },
    { label: "متوسط الطلب", value: `${data.summary.aov} ر.س`, icon: BarChart3, tint: "text-viol-400 bg-viol-500/10 border-viol-500/25" },
    { label: "العملاء", value: String(data.summary.customers), icon: Users, tint: "text-amber-400 bg-amber-500/10 border-amber-400/25" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">التحليلات والتقارير</h2>
        <p className="text-sm text-ink-300 mt-1">نظرة على أداء متجرك</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-3xl p-5">
            <span className={`grid place-items-center w-11 h-11 rounded-2xl border ${c.tint} mb-4`}><c.icon className="w-5 h-5" /></span>
            <p className="font-latin font-bold text-2xl">{c.value}</p>
            <p className="text-xs text-ink-300 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-neon-400" /> الأكثر مبيعًا</h3>
          {data.topProducts.length === 0 ? <p className="text-sm text-ink-300 py-4 text-center">لا مبيعات بعد</p> : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="font-latin text-xs text-ink-300 w-5">{i + 1}</span>
                  <span className="flex-1 text-sm truncate">{p.name}</span>
                  <span className="font-latin text-xs text-ink-300">×{p.qty}</span>
                  <span className="font-latin text-sm font-bold text-neon-400">{p.revenue} ر.س</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold mb-4">توزيع حالات الطلبات</h3>
          {data.byStatus.length === 0 ? <p className="text-sm text-ink-300 py-4 text-center">لا طلبات بعد</p> : (
            <div className="space-y-3">
              {data.byStatus.map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-ink-200">{STATUS_LABEL[s.status] ?? s.status}</span>
                  <span className="font-latin font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h3 className="font-bold mb-4">المبيعات حسب القسم</h3>
        {data.byCategory.length === 0 ? <p className="text-sm text-ink-300 py-4 text-center">لا بيانات بعد</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.byCategory.map((c) => (
              <div key={c.category} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="text-sm">{c.category}</span>
                <span className="font-latin text-sm font-bold text-neon-400">{c.revenue} ر.س</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
