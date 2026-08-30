"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowDownToLine, Undo2, CheckCircle2, Clock, Loader2, RefreshCw, CreditCard } from "lucide-react";

type WalletData = {
  received: number;
  refunded: number;
  paidOrders: number;
  pendingOrders: number;
  byPayment: { method: string; total: number }[];
};

const PAYMENT_LABEL: Record<string, string> = {
  card: "بطاقة", mada: "مدى", apple_pay: "Apple Pay", cash: "نقدي", simulated: "مدفوع", manual: "يدوي",
};

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null);

  async function load() {
    const r = await fetch("/api/merchant/wallet");
    setData(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  if (!data) {
    return <div className="glass rounded-3xl p-14 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل المحفظة...</div>;
  }

  const cards = [
    { label: "المبالغ المحصّلة", value: `${data.received} ر.س`, icon: Wallet, tint: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
    { label: "المسترجع", value: `${data.refunded} ر.س`, icon: Undo2, tint: "text-rose-400 bg-rose-400/10 border-rose-400/25" },
    { label: "طلبات مدفوعة", value: String(data.paidOrders), icon: CheckCircle2, tint: "text-neon-400 bg-neon-400/10 border-neon-400/25" },
    { label: "بانتظار الدفع", value: String(data.pendingOrders), icon: Clock, tint: "text-amber-400 bg-amber-400/10 border-amber-400/25" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">المحفظة</h2>
          <p className="text-sm text-ink-300 mt-1">ملخص مبالغ متجرك المحصّلة من الطلبات</p>
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
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

      <div className="glass rounded-3xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-neon-400" /> توزيع المبالغ حسب طريقة الدفع</h3>
        {data.byPayment.length === 0 ? (
          <p className="text-sm text-ink-300 py-4 text-center">لا مبالغ محصّلة بعد</p>
        ) : (
          <div className="space-y-3">
            {data.byPayment.map((p) => (
              <div key={p.method} className="flex items-center gap-3">
                <span className="w-28 text-sm">{PAYMENT_LABEL[p.method] ?? p.method}</span>
                <div className="flex-1 h-6 bg-white/4 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500/60 to-neon-400 rounded-full" style={{ width: `${data.received ? (p.total / data.received) * 100 : 0}%` }} />
                </div>
                <span className="font-latin font-bold text-sm w-20 text-left">{p.total} ر.س</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
