"use client";

import { useEffect, useState } from "react";
import { Users, RefreshCw, Search, ChevronDown, Package, Mail, Phone, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
};
type CustOrder = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  paymentStatus: string;
  items: { productName: string; qty: number; price: number }[];
};

const STATUS_LABEL: Record<string, string> = {
  paid: "مدفوع", awaiting_payment: "بانتظار الدفع", processing: "قيد التجهيز", ready: "جاهز",
  shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي", refunded: "مسترجع",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ customer: Customer; orders: CustOrder[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  async function toggle(c: Customer) {
    if (expanded === c.id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(c.id);
    setLoadingDetail(true);
    try {
      const r = await fetch(`/api/merchant/customers/${c.id}`);
      const d = await r.json();
      if (r.ok) setDetail(d);
      else toast.error(d.error || "تعذر التحميل");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setLoadingDetail(false);
    }
  }

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
              <div key={c.id}>
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-white/3">
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
                  <button onClick={() => toggle(c)} className="btn-ghost rounded-xl p-2 shrink-0">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded === c.id ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {expanded === c.id && (
                  <div className="px-5 pb-5 bg-white/2 border-t border-white/5">
                    {loadingDetail ? (
                      <div className="py-8 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
                    ) : detail && (
                      <div className="pt-4 grid lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2">
                          <p className="text-xs text-ink-300 mb-3 font-semibold">سجل الطلبات ({detail.orders.length})</p>
                          {detail.orders.length === 0 ? (
                            <p className="text-sm text-ink-300 py-4 text-center">لا طلبات لهذا العميل بعد</p>
                          ) : (
                            <div className="space-y-2">
                              {detail.orders.map((o) => (
                                <div key={o.id} className="rounded-2xl bg-white/5 px-4 py-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="font-latin font-bold text-xs">#{o.orderNumber}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/25 text-emerald-400">
                                      {STATUS_LABEL[o.status] ?? o.status}
                                    </span>
                                    <span className="font-latin font-bold text-xs text-neon-400">{o.total} ر.س</span>
                                    <span className="font-latin text-[10px] text-ink-300">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {o.items.map((it, i) => (
                                      <div key={i} className="flex items-center justify-between text-xs text-ink-300">
                                        <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-neon-400" /> {it.productName}</span>
                                        <span className="font-latin">×{it.qty} · {it.price} ر.س</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-2xl bg-white/5 px-4 py-3 text-xs space-y-2">
                            <p className="text-ink-300 font-semibold">معلومات العميل</p>
                            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-neon-400" /><span className="font-latin">{detail.customer.email}</span></div>
                            {detail.customer.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-neon-400" /><span className="font-latin">{detail.customer.phone}</span></div>}
                            <div className="flex justify-between pt-1"><span className="text-ink-300">عميل منذ</span><span className="font-latin">{new Date(detail.customer.createdAt).toLocaleDateString("ar-SA")}</span></div>
                          </div>

                          {detail.customer.tags && detail.customer.tags.length > 0 && (
                            <div className="rounded-2xl bg-white/5 px-4 py-3">
                              <p className="text-ink-300 font-semibold text-xs mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-neon-400" /> المجموعات</p>
                              <div className="flex flex-wrap gap-1.5">
                                {detail.customer.tags.map((t) => (
                                  <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-neon-400/10 text-neon-400 border border-neon-400/20">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {detail.customer.notes && (
                            <div className="rounded-2xl bg-white/5 px-4 py-3 text-xs">
                              <p className="text-ink-300 font-semibold mb-1">ملاحظات</p>
                              <p className="text-ink-200 leading-relaxed">{detail.customer.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
