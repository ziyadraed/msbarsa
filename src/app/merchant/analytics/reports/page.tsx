"use client";

import { useEffect, useState } from "react";
import { TrendingUp, CalendarDays, CreditCard, Trophy, RefreshCw, Loader2, Boxes } from "lucide-react";

type Report = {
  days: number;
  byDay: { day: string; revenue: number; orders: number }[];
  byPayment: { method: string; n: number; total: number }[];
  topCustomers: { email: string; name: string; spent: number; orders: number }[];
  byCategory: { category: string; qty: number; revenue: number }[];
};

const PAYMENT_LABEL: Record<string, string> = {
  card: "بطاقة",
  mada: "مدى",
  apple_pay: "Apple Pay",
  cash: "نقدي",
  simulated: "مدفوع",
};

export default function ReportsPage() {
  const [data, setData] = useState<Report | null>(null);
  const [days, setDays] = useState(30);

  async function load(d: number) {
    const r = await fetch(`/api/merchant/reports?days=${d}`);
    setData(await r.json());
  }
  useEffect(() => {
    load(days);
  }, [days]);

  const maxRev = data?.byDay.length ? Math.max(...data.byDay.map((b) => b.revenue)) : 1;
  const maxCat = data?.byCategory.length ? Math.max(...data.byCategory.map((c) => c.revenue)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">التقارير التفصيلية</h2>
          <p className="text-sm text-ink-300 mt-1">مبيعات وأداء العملاء والفئات خلال فترة محددة</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold ${days === d ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}
            >
              {d} يوم
            </button>
          ))}
          <button onClick={() => load(days)} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {!data ? (
        <div className="glass rounded-3xl p-14 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily sales */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-neon-400" /> المبيعات اليومية</h3>
            {data.byDay.length === 0 ? (
              <p className="text-sm text-ink-300 py-6 text-center">لا مبيعات في هذه الفترة</p>
            ) : (
              <div className="space-y-2.5">
                {data.byDay.map((b) => (
                  <div key={b.day} className="flex items-center gap-3 text-xs">
                    <span className="font-latin text-ink-300 w-20 shrink-0">{b.day}</span>
                    <div className="flex-1 h-6 bg-white/4 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-500/60 to-neon-400 rounded-full" style={{ width: `${(b.revenue / maxRev) * 100}%` }} />
                    </div>
                    <span className="font-latin font-semibold w-16 text-left">{b.revenue} ر.س</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-neon-400" /> طرق الدفع</h3>
            {data.byPayment.length === 0 ? (
              <p className="text-sm text-ink-300 py-6 text-center">لا بيانات</p>
            ) : (
              <div className="space-y-3">
                {data.byPayment.map((p) => (
                  <div key={p.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5"><CreditCard className="w-4 h-4 text-ink-200" /></span>
                      <span className="text-sm font-semibold">{PAYMENT_LABEL[p.method] ?? p.method}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-latin font-bold text-sm">{p.total} ر.س</p>
                      <p className="text-[11px] text-ink-300">{p.n} طلب</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top customers */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-gold" /> أفضل العملاء</h3>
            {data.topCustomers.length === 0 ? (
              <p className="text-sm text-ink-300 py-6 text-center">لا عملاء بعد</p>
            ) : (
              <div className="space-y-3">
                {data.topCustomers.map((c, i) => (
                  <div key={c.email} className="flex items-center gap-3">
                    <span className="font-latin text-xs text-ink-300 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      <p className="text-[11px] text-ink-300 font-latin truncate">{c.email} · {c.orders} طلب</p>
                    </div>
                    <p className="font-latin font-bold text-sm">{c.spent} ر.س</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Boxes className="w-4 h-4 text-neon-400" /> أداء الفئات</h3>
            {data.byCategory.length === 0 ? (
              <p className="text-sm text-ink-300 py-6 text-center">لا بيانات</p>
            ) : (
              <div className="space-y-3">
                {data.byCategory.map((c) => (
                  <div key={c.category} className="flex items-center gap-3 text-xs">
                    <span className="w-24 truncate shrink-0">{c.category}</span>
                    <div className="flex-1 h-5 bg-white/4 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-viol-500/60 to-neon-400 rounded-full" style={{ width: `${(c.revenue / maxCat) * 100}%` }} />
                    </div>
                    <span className="font-latin font-semibold w-16 text-left">{c.revenue} ر.س</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
