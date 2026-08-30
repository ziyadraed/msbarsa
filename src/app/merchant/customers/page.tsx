"use client";

import { useEffect, useState } from "react";
import { Users, RefreshCw, Search } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  createdAt: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/merchant/customers?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setCustomers(d.customers ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">العملاء</h2>
          <p className="text-sm text-ink-300 mt-1">قاعدة عملاء متجرك — {customers.length} عميل</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input className="inp pl-3 pr-10" placeholder="ابحث بالاسم أو البريد أو الجوال..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl px-4 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا عملاء بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            {customers.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/3">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-neon-500/30 to-viol-500/30 border border-white/10 font-bold text-xs shrink-0">
                  {c.name?.[0] ?? "ع"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[11px] text-ink-300 truncate">{c.email} {c.phone && `· ${c.phone}`}</p>
                </div>
                <div className="text-center shrink-0">
                  <p className="font-latin font-bold text-sm">{c.orderCount}</p>
                  <p className="text-[10px] text-ink-300">طلبات</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="font-latin font-bold text-sm text-neon-400">{c.totalSpent} ر.س</p>
                  <p className="text-[10px] text-ink-300">إجمالي الإنفاق</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
