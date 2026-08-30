"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, Loader2 } from "lucide-react";

type Order = { id: string; orderNumber: string; customerName: string; email: string; phone: string; total: number; status: string; createdAt: string };

const SHIPPED = ["shipped", "completed"];

export default function LabelsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/merchant/orders");
        const d = await r.json();
        setOrders((d.orders ?? []).filter((o: Order) => SHIPPED.includes(o.status)));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">أرشيف البوليصات</h2>
          <p className="text-sm text-ink-300 mt-1">الطلبات المشحونة في متجرك — {orders.length} بوليصة</p>
        </div>
        <button onClick={() => setLoading(false)} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا بوليصات شحن بعد — ستظهر هنا الطلبات التي حالتها «تم الشحن» أو «مكتمل»</div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((o) => (
              <div key={o.id} className="px-5 py-4 flex items-center gap-4">
                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0"><FileText className="w-5 h-5 text-neon-400" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-latin font-bold text-sm">#{o.orderNumber}</p>
                  <p className="text-[11px] text-ink-300 truncate">{o.customerName} · {o.email} {o.phone && `· ${o.phone}`}</p>
                </div>
                <p className="font-latin font-bold text-sm">{o.total} ر.س</p>
                <p className="text-[11px] text-ink-300 font-latin shrink-0">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
