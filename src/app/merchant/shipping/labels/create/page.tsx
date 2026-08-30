"use client";

import { useEffect, useState } from "react";
import { FilePlus2, Loader2, Printer, Ban, Truck } from "lucide-react";
import { toast } from "sonner";

type O = { id: string; orderNumber: string; customerName: string; total: number; status: string; shippingMethod: string };
type Label = { id: string; orderNumber: string; status: string };

export default function ShippingLabelsPage() {
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState<O[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/merchant/orders?limit=200").then((r) => r.json()),
      fetch("/api/merchant/settings").then((r) => r.json()),
    ]).then(([d, s]) => {
      setOrders((Array.isArray(d.orders) ? d.orders : []).filter((o: O) => !["delivered", "cancelled", "refunded"].includes(o.status)));
      setLabels((s.store?.settings?.shippingLabels ?? []) as Label[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function create(o: O) {
    setActing(true);
    try {
      const next = [...labels.filter((l) => l.orderNumber !== o.orderNumber), { id: crypto.randomUUID(), orderNumber: o.orderNumber, status: "issued" }];
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { shippingLabels: next } }),
      });
      if (r.ok) { setLabels(next); toast.success(`تم إنشاء بوليصة #${o.orderNumber}`); }
      else toast.error("تعذر الإنشاء");
    } finally { setActing(false); }
  }

  async function cancel(l: Label) {
    setActing(true);
    try {
      const next = labels.map((x) => x.id === l.id ? { ...x, status: "cancelled" } : x);
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { shippingLabels: next } }),
      });
      if (r.ok) { setLabels(next); toast.success("تم إلغاء البوليصة"); }
    } finally { setActing(false); }
  }

  const unlabeled = orders.filter((o) => !labels.some((l) => l.orderNumber === o.orderNumber));

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h2 className="text-2xl font-bold">بوليصات الشحن</h2><p className="text-sm text-ink-300 mt-1">أنشئ، اطبع، وألغِ بوليصات الشحن</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-neon-400/15 text-neon-400"><FilePlus2 className="w-5 h-5" /></span>
              <p className="font-bold text-sm">إنشاء بوليصة جديدة</p>
            </div>
            <div className="space-y-2">
              {unlabeled.length === 0 && <p className="text-xs text-ink-300/60 text-center py-3">كل الطلبات النشطة لها بوليصات</p>}
              {unlabeled.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                  <Truck className="w-4 h-4 text-ink-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{o.customerName}</p>
                    <p className="text-[11px] text-ink-300 font-latin">#{o.orderNumber} · {o.shippingMethod || "شحن"} · {o.total} ر.س</p>
                  </div>
                  <button onClick={() => create(o)} disabled={acting} className="btn-primary rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1.5">
                    <FilePlus2 className="w-3.5 h-3.5" /> إنشاء بوليصة
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="font-bold text-sm mb-3">{labels.length} بوليصة</p>
            <div className="space-y-2">
              {labels.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                  <span className="text-sm font-latin font-semibold">#{l.orderNumber}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${l.status === "issued" ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"}`}>{l.status === "issued" ? "صادرة" : "ملغاة"}</span>
                  <div className="flex-1" />
                  {l.status === "issued" && (
                    <button onClick={() => toast.success("تم تجهيز البوليصة للطباعة")} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-ink-200 hover:text-neon-400"><Printer className="w-3.5 h-3.5" /> طباعة</button>
                  )}
                  <button onClick={() => cancel(l)} disabled={acting || l.status !== "issued"} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-ink-300 hover:text-red-400 disabled:opacity-40"><Ban className="w-3.5 h-3.5" /> إلغاء</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
