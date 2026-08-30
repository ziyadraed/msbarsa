"use client";

import { useEffect, useState } from "react";
import { RefreshCw, RotateCcw, Loader2, Receipt, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "مدفوع",
  awaiting_payment: "بانتظار الدفع",
  processing: "قيد التجهيز",
  ready: "جاهز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
  refunded: "مسترجع",
};

export default function RefundsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"eligible" | "refunded">("eligible");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/orders");
      const d = await r.json();
      setOrders(d.orders ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const eligible = orders.filter((o) => ["paid", "processing", "ready", "shipped", "completed"].includes(o.status));
  const refunded = orders.filter((o) => o.status === "refunded");

  async function refund(o: Order) {
    if (!confirm(`استرداد مبلغ طلب ${o.orderNumber} بقيمة ${o.total} ر.س؟`)) return;
    setBusy(o.id);
    try {
      const r = await fetch("/api/merchant/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: o.id, status: "refunded" }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الاسترداد");
      toast.success("تم استرداد الطلب");
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setBusy(null);
    }
  }

  const list = tab === "eligible" ? eligible : refunded;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">المرتجعات والاسترداد</h2>
          <p className="text-sm text-ink-300 mt-1">إدارة عمليات استرداد المبالغ للطلبات</p>
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("eligible")}
          className={`rounded-2xl px-5 py-2.5 text-sm font-semibold ${tab === "eligible" ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}
        >
          مؤهلة للاسترداد ({eligible.length})
        </button>
        <button
          onClick={() => setTab("refunded")}
          className={`rounded-2xl px-5 py-2.5 text-sm font-semibold ${tab === "refunded" ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}
        >
          مسترجعة ({refunded.length})
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">
            {tab === "eligible" ? "لا طلبات مؤهلة للاسترداد" : "لا طلبات مسترجعة بعد"}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {list.map((o) => (
              <div key={o.id} className="px-5 py-4 flex flex-wrap items-center gap-4">
                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0">
                  {o.status === "refunded" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Receipt className="w-5 h-5 text-neon-400" />
                  )}
                </span>
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-semibold font-latin">#{o.orderNumber}</p>
                  <p className="text-[11px] text-ink-300 truncate">{o.customerName} · {o.email}</p>
                </div>
                <p className="font-latin font-bold text-sm">{o.total} ر.س</p>
                <span className={`text-[11px] px-2 py-1 rounded-full border ${o.status === "refunded" ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" : "bg-white/5 text-ink-300 border-white/10"}`}>
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
                {o.status !== "refunded" && (
                  <button
                    onClick={() => refund(o)}
                    disabled={busy === o.id}
                    className="rounded-xl px-3 py-2 text-xs font-semibold border border-rose-400/30 text-rose-300 hover:bg-rose-400/10 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {busy === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />} استرداد
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
