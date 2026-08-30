"use client";

import { useEffect, useState } from "react";
import { UserCheck, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type Order = { id: string; orderNumber: string; customerName: string; total: number; status: string; assignee?: string };
type Staff = { id: string; name: string; email: string };

export default function AssignOrdersPage() {
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/merchant/orders?limit=100").then((r) => r.json()),
      fetch("/api/merchant/staff").then((r) => r.json()).catch(() => ({ staff: [] })),
    ]).then(([d, s]) => {
      const list = (Array.isArray(d.orders) ? d.orders : []).filter((o: Order) => !["delivered", "cancelled", "refunded"].includes(o.status));
      setOrders(list);
      setStaff(Array.isArray(s.staff) ? s.staff : []);
      const m: Record<string, string> = {};
      list.forEach((o: any) => {
        const note = o.notes || "";
        if (note.startsWith("مسند:")) m[o.id] = note.slice("مسند:".length).trim();
      });
      setAssignments(m);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await Promise.all(orders.map((o) => {
        const a = assignments[o.id];
        if (a === undefined) return Promise.resolve();
        return fetch("/api/merchant/orders", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: o.id, notes: `مسند: ${a}` }),
        }).catch(() => null);
      }));
      toast.success("تم إسناد الطلبات للموظفين");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">إسناد الطلبات للموظفين</h2><p className="text-sm text-ink-300 mt-1">وزّع الطلبات على فريقك للمتابعة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><UserCheck className="w-5 h-5 text-viol-400" /></span>
              <p className="font-bold text-sm">{orders.length} طلب نشط</p>
            </div>
            <button onClick={save} disabled={saving || staff.length === 0} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الإسناد
            </button>
          </div>
          {staff.length === 0 && <p className="text-xs text-amber-400">لا يوجد موظفون — أضف موظفين من إدارة الموظفين أولًا</p>}
          <div className="space-y-2">
            {orders.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد طلبات نشطة</p>}
            {orders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{o.customerName}</p>
                  <p className="text-[11px] text-ink-300 font-latin">#{o.orderNumber} · {o.total.toLocaleString()} ر.س</p>
                </div>
                <select
                  className="rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50"
                  value={assignments[o.id] ?? ""}
                  onChange={(e) => setAssignments({ ...assignments, [o.id]: e.target.value })}
                >
                  <option value="">غير مُسنَد</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
