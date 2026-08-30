"use client";

import { useEffect, useState } from "react";
import { User, Loader2, Wallet, ShoppingBag, MapPin, Mail, Phone } from "lucide-react";

type C = { id: string; name: string; email: string; phone: string; totalSpent: number; orderCount: number; tags: string[]; notes: string; address: Record<string, string> };
type O = { id: string; orderNumber: string; total: number; status: string; createdAt: string; customerName: string };

export default function CustomerCardPage() {
  const [loaded, setLoaded] = useState(false);
  const [customers, setCustomers] = useState<C[]>([]);
  const [selected, setSelected] = useState<C | null>(null);
  const [orders, setOrders] = useState<O[]>([]);

  useEffect(() => {
    fetch("/api/merchant/customers").then((r) => r.json()).then((d) => setCustomers(Array.isArray(d.customers) ? d.customers : [])).finally(() => setLoaded(true));
  }, []);

  async function select(c: C) {
    setSelected(c);
    const d = await fetch("/api/merchant/orders?limit=200").then((r) => r.json());
    setOrders((Array.isArray(d.orders) ? d.orders : []).filter((o: O) => o.customerName === c.name));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h2 className="text-2xl font-bold">بطاقة العميل</h2><p className="text-sm text-ink-300 mt-1">ملف تفصيلي: بيانات، طلبات، محفظة، عناوين</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="glass rounded-3xl p-4 lg:max-h-[60vh] overflow-y-auto space-y-1">
            <p className="text-xs text-ink-300 font-semibold mb-2">اختر عميلًا</p>
            {customers.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا عملاء</p>}
            {customers.map((c) => (
              <button key={c.id} onClick={() => select(c)} className={`w-full flex items-center gap-2 rounded-xl p-2 text-right text-sm ${selected?.id === c.id ? "bg-neon-400/10 text-neon-400" : "hover:bg-white/5"}`}>
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 shrink-0"><User className="w-4 h-4" /></span>
                <span className="truncate font-semibold">{c.name}</span>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/15 border border-neon-400/30"><User className="w-7 h-7 text-neon-400" /></span>
                  <div className="flex-1">
                    <p className="text-xl font-bold">{selected.name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-ink-300">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selected.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selected.phone || "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(selected.tags || []).map((t, i) => <span key={i} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px]">{t}</span>)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-emerald-400">{selected.totalSpent.toLocaleString()} ر.س</p>
                    <p className="text-xs text-ink-300">{selected.orderCount} طلب</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass rounded-3xl p-5">
                  <p className="text-sm font-bold flex items-center gap-2 mb-3"><Wallet className="w-4 h-4 text-emerald-400" /> المحفظة والرصيد</p>
                  <p className="text-2xl font-black">{selected.totalSpent.toLocaleString()} ر.س</p>
                  <p className="text-[11px] text-ink-300">إجمالي الإنفاق</p>
                </div>
                <div className="glass rounded-3xl p-5">
                  <p className="text-sm font-bold flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-sky-400" /> العنوان</p>
                  <p className="text-sm text-ink-100">{selected.address?.city || "غير محدد"}</p>
                </div>
              </div>

              <div className="glass rounded-3xl p-5">
                <p className="text-sm font-bold flex items-center gap-2 mb-3"><ShoppingBag className="w-4 h-4 text-viol-400" /> طلبات العميل</p>
                {orders.length === 0 ? (
                  <p className="text-xs text-ink-300/60 text-center py-4">لا توجد طلبات مطابقة</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
                        <div>
                          <p className="text-sm font-semibold font-latin">#{o.orderNumber}</p>
                          <p className="text-[11px] text-ink-300">{o.status}</p>
                        </div>
                        <span className="text-sm font-latin font-bold">{o.total.toLocaleString()} ر.س</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 glass rounded-3xl p-10 text-center text-ink-300 text-sm">اختر عميلًا لعرض بطاقته</div>
          )}
        </div>
      )}
    </div>
  );
}
