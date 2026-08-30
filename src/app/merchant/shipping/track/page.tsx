"use client";

import { useEffect, useState } from "react";
import { Truck, Loader2, Search } from "lucide-react";

export default function TrackPage() {
  const [orders, setOrders] = useState<{ id: string; orderNumber: string; customerName: string; total: number; status: string; shippingMethod: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/merchant/orders?limit=50").then((r) => r.json()).then((d) => {
      const list = Array.isArray(d.orders) ? d.orders.filter((o: any) => o.shippingMethod) : [];
      setOrders(list);
    }).finally(() => setLoaded(true));
  }, []);

  const filtered = orders.filter((o) => !q || o.orderNumber.includes(q) || o.customerName.includes(q));

  const STEPS = [
    { label: "تم إنشاء الطلب", match: (s: string) => true },
    { label: "قيد التجهيز", match: (s: string) => ["processing", "packed", "shipped", "delivered"].includes(s) },
    { label: "تم الشحن", match: (s: string) => ["shipped", "delivered"].includes(s) },
    { label: "تم التسليم", match: (s: string) => ["delivered"].includes(s) },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تتبع البوليصات</h2><p className="text-sm text-ink-300 mt-1">تتبع حالة شحناتك المربوطة بطلبات فعلية</p></div>

      <div className="glass rounded-3xl p-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-ink-300" />
        <input className="flex-1 bg-transparent outline-none text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث برقم الطلب أو اسم العميل..." />
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-xs text-ink-300/60 text-center py-6">لا توجد شحنات مطابقة</p>}
          {filtered.map((o) => {
            const activeStep = STEPS.findIndex((s) => s.match(o.status));
            return (
              <div key={o.id} className="glass rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 border border-white/10"><Truck className="w-4 h-4 text-neon-400" /></span>
                    <div>
                      <p className="text-sm font-bold">{o.customerName}</p>
                      <p className="text-[11px] text-ink-300 font-latin">#{o.orderNumber} · {o.shippingMethod}</p>
                    </div>
                  </div>
                  <span className="text-sm font-latin font-bold">{o.total.toLocaleString()} ر.س</span>
                </div>
                <div className="flex items-center">
                  {STEPS.map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                      {i < STEPS.length - 1 && <div className={`absolute top-2 left-1/2 w-full h-0.5 ${i <= activeStep ? "bg-neon-400" : "bg-white/10"}`} />}
                      <span className={`relative z-10 grid place-items-center w-4 h-4 rounded-full ${i <= activeStep ? "bg-neon-400" : "bg-white/10"}`} />
                      <span className={`text-[10px] text-center ${i <= activeStep ? "text-neon-400" : "text-ink-300"}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
