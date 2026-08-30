"use client";

import { useEffect, useState } from "react";
import { Layers, Loader2, Check, Save } from "lucide-react";
import { toast } from "sonner";

type Order = { id: string; orderNumber: string; customerName: string; total: number; status: string };

const STATUSES = [
  { v: "paid", label: "مدفوع" }, { v: "processing", label: "قيد التجهيز" },
  { v: "shipped", label: "تم الشحن" }, { v: "completed", label: "مكتمل" },
  { v: "cancelled", label: "ملغي" }, { v: "refunded", label: "مسترد" },
];

export default function BulkStatusPage() {
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState("shipped");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/orders?limit=200").then((r) => r.json()).then((d) => {
      const list = (Array.isArray(d.orders) ? d.orders : []).filter((o: Order) => !["cancelled", "refunded", "completed"].includes(o.status));
      setOrders(list);
    }).finally(() => setLoaded(true));
  }, []);

  function toggle(id: string) {
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function toggleAll() {
    setSelected((p) => (p.size === orders.length ? new Set() : new Set(orders.map((o) => o.id))));
  }

  async function apply() {
    if (selected.size === 0) return toast.error("اختر طلبات أولًا");
    setSaving(true);
    try {
      let ok = 0;
      for (const id of selected) {
        const r = await fetch("/api/merchant/orders", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, status: target }),
        });
        if (r.ok) ok++;
      }
      toast.success(`تم تحديث ${ok} طلب`);
      setSelected(new Set());
      const d = await fetch("/api/merchant/orders?limit=200").then((r) => r.json());
      setOrders((Array.isArray(d.orders) ? d.orders : []).filter((o: Order) => !["cancelled", "refunded", "completed"].includes(o.status)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تحديث حالة مجموعة طلبات</h2><p className="text-sm text-ink-300 mt-1">غيّر حالة عدة طلبات دفعة واحدة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><Layers className="w-5 h-5 text-viol-400" /></span>
            <p className="font-bold text-sm">{selected.size} طلب محدد من {orders.length}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <button key={s.v} onClick={() => setTarget(s.v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${target === s.v ? "bg-neon-400/15 text-neon-400 border border-neon-400/30" : "bg-white/5 text-ink-300 border border-white/10"}`}>{s.label}</button>
            ))}
            <button onClick={apply} disabled={saving || selected.size === 0} className="btn-primary rounded-lg px-4 py-1.5 text-xs font-bold flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} تطبيق
            </button>
          </div>

          <button onClick={toggleAll} className="flex items-center gap-2 text-xs text-neon-400">
            <span className={`grid place-items-center w-4 h-4 rounded border ${selected.size === orders.length && orders.length ? "bg-neon-400 text-ink-900" : "border-white/20"}`}>
              {selected.size === orders.length && orders.length ? <Check className="w-3 h-3" /> : ""}
            </span> تحديد الكل
          </button>

          <div className="space-y-2">
            {orders.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد طلبات قابلة للتحديث</p>}
            {orders.map((o) => (
              <button key={o.id} onClick={() => toggle(o.id)} className={`w-full flex items-center gap-3 rounded-xl border p-3 text-right ${selected.has(o.id) ? "border-neon-400/40 bg-neon-400/5" : "border-white/10 bg-ink-900/40"}`}>
                <span className={`grid place-items-center w-5 h-5 rounded border shrink-0 ${selected.has(o.id) ? "bg-neon-400 text-ink-900 border-neon-400" : "border-white/20"}`}>
                  {selected.has(o.id) ? <Check className="w-3.5 h-3.5" /> : ""}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{o.customerName}</p>
                  <p className="text-[11px] text-ink-300 font-latin">#{o.orderNumber}</p>
                </div>
                <span className="text-sm font-latin font-bold">{o.total.toLocaleString()} ر.س</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
