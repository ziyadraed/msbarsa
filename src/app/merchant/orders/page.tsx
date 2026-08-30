"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, RefreshCw, Search, Loader2, Package, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  subtotal: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: { productName: string; qty: number; price: number }[];
};

const STATUSES = [
  { value: "all", label: "الكل" },
  { value: "awaiting_payment", label: "بانتظار الدفع" },
  { value: "paid", label: "مدفوع" },
  { value: "processing", label: "قيد التجهيز" },
  { value: "ready", label: "جاهز" },
  { value: "shipped", label: "تم الشحن" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];
const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));
const STATUS_COLOR: Record<string, string> = {
  all: "bg-white/5 border-white/10 text-ink-200",
  awaiting_payment: "bg-amber-400/10 border-amber-400/25 text-amber-300",
  paid: "bg-emerald-400/10 border-emerald-400/25 text-emerald-400",
  processing: "bg-sky-400/10 border-sky-400/25 text-sky-300",
  ready: "bg-viol-500/10 border-viol-500/25 text-viol-400",
  shipped: "bg-indigo-400/10 border-indigo-400/25 text-indigo-300",
  completed: "bg-teal-400/10 border-teal-400/25 text-teal-300",
  cancelled: "bg-rose-500/10 border-rose-500/25 text-rose-300",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Manual order form
  const [mCustomer, setMCustomer] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mItems, setMItems] = useState<{ name: string; price: string; qty: string }[]>([{ name: "", price: "", qty: "1" }]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/merchant/orders?status=${status}&q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setOrders(d.orders ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function changeStatus(orderId: string, next: string) {
    const r = await fetch("/api/merchant/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: next }),
    });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "تعذر التحديث");
    toast.success("تم تحديث حالة الطلب");
    load();
  }

  async function createManual(e: React.FormEvent) {
    e.preventDefault();
    const items = mItems
      .filter((i) => i.name.trim() && Number(i.price) > 0)
      .map((i) => ({ name: i.name.trim(), price: Math.round(Number(i.price)), qty: Math.max(1, Number(i.qty) || 1), slug: i.name.trim().replace(/\s+/g, "-"), categorySlug: "manual" }));
    if (!items.length) return toast.error("أضف منتجًا واحدًا على الأقل بسعر");
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: mCustomer, email: mEmail, phone: mPhone, items }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الإنشاء");
      toast.success("تم إنشاء الطلب اليدوي");
      setShowManual(false);
      setMCustomer(""); setMEmail(""); setMPhone(""); setMItems([{ name: "", price: "", qty: "1" }]);
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الطلبات</h2>
          <p className="text-sm text-ink-300 mt-1">إدارة طلبات متجرك — {orders.length} طلب</p>
        </div>
        <button onClick={() => setShowManual((v) => !v)} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> طلب يدوي
        </button>
      </div>

      {/* Manual order form */}
      {showManual && (
        <form onSubmit={createManual} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-neon-400" /> إنشاء طلب يدوي</h3>
            <button type="button" onClick={() => setShowManual(false)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">اسم العميل *</span>
              <input className="inp" value={mCustomer} onChange={(e) => setMCustomer(e.target.value)} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">البريد *</span>
              <input className="inp" type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الجوال</span>
              <input className="inp" value={mPhone} onChange={(e) => setMPhone(e.target.value)} />
            </label>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-ink-300 font-semibold">المنتجات</p>
            {mItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className="inp flex-1" placeholder="اسم المنتج" value={item.name} onChange={(e) => { const n = [...mItems]; n[idx].name = e.target.value; setMItems(n); }} />
                <input className="inp w-32" type="number" placeholder="السعر" value={item.price} onChange={(e) => { const n = [...mItems]; n[idx].price = e.target.value; setMItems(n); }} />
                <input className="inp w-20" type="number" placeholder="كمية" value={item.qty} onChange={(e) => { const n = [...mItems]; n[idx].qty = e.target.value; setMItems(n); }} />
                <button type="button" onClick={() => setMItems(mItems.filter((_, i) => i !== idx))} className="btn-ghost rounded-xl p-2 text-rose-300"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setMItems([...mItems, { name: "", price: "", qty: "1" }])} className="text-xs text-neon-400 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> إضافة منتج
            </button>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} إنشاء الطلب
            </button>
            <button type="button" onClick={() => setShowManual(false)} className="btn-ghost rounded-2xl px-6 py-3 text-sm font-semibold">إلغاء</button>
          </div>
        </form>
      )}

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
              status === s.value ? STATUS_COLOR[s.value] : "bg-white/5 border-white/10 text-ink-300 hover:text-ink-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input className="inp pl-3 pr-10" placeholder="ابحث بالبريد أو الاسم..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl px-4 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm">لا طلبات في هذه الفئة</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="glass rounded-3xl p-5 hover-lift">
              <div className="flex flex-wrap items-center gap-4">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-white/5 shrink-0">
                  <ShoppingBag className="w-5 h-5 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-latin font-bold text-sm">{o.orderNumber}</p>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${STATUS_COLOR[o.status] ?? STATUS_COLOR.all}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    {o.paymentMethod === "manual" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-ink-300">يدوي</span>
                    )}
                  </div>
                  <p className="text-sm text-ink-200 truncate mt-1">{o.customerName} · {o.email}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="font-latin font-bold">{o.total} ر.س</p>
                  <p className="text-[11px] text-ink-300">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</p>
                </div>
                <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold">
                  {expanded === o.id ? "إخفاء" : "تفاصيل"}
                </button>
              </div>

              {expanded === o.id && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-ink-300 mb-3 font-semibold">المنتجات</p>
                  <div className="space-y-2 mb-4">
                    {(o.items ?? []).map((it, i) => (
                      <div key={i} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2.5">
                        <span className="text-sm flex items-center gap-2"><Package className="w-4 h-4 text-neon-400" /> {it.productName}</span>
                        <span className="font-latin text-xs text-ink-300">×{it.qty} · {it.price} ر.س</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-ink-300">تغيير الحالة:</span>
                    {["processing", "shipped", "completed", "cancelled"].map((s) => (
                      <button key={s} onClick={() => changeStatus(o.id, s)} disabled={o.status === s}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-ink-300 hover:text-ink-100 disabled:opacity-40 transition-colors">
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
