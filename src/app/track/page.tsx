"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PackageSearch, Loader2, Copy, KeyRound, CircleAlert } from "lucide-react";
import { formatSAR } from "@/lib/utils";

type OrderData = {
  orderNumber: string;
  status: string;
  customerName: string;
  email: string;
  total: number;
  createdAt: string;
  items: { productName: string; price: number; licenseKey: string }[];
};

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const r = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "تعذر العثور على الطلب");
      setOrder(d.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر العثور على الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-10">
        <span className="mx-auto mb-6 grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30 text-neon-400">
          <PackageSearch className="w-8 h-8" strokeWidth={1.6} />
        </span>
        <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">TRACK ORDER</p>
        <h1 className="text-4xl font-bold">تتبع الطلب</h1>
        <p className="text-ink-300 mt-4 leading-8">أدخل رقم الطلب والبريد المستخدم وقت الشراء لعرض حالة الطلب وأكواد التفعيل.</p>
      </div>

      <form onSubmit={submit} className="glass rounded-3xl p-7 space-y-5">
        <div>
          <label className="block text-xs text-ink-300 mb-2">رقم الطلب</label>
          <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} dir="ltr" className="field text-left font-latin" placeholder="MB-123456" required />
        </div>
        <div>
          <label className="block text-xs text-ink-300 mb-2">البريد الإلكتروني</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" className="field text-left" placeholder="you@email.com" required />
        </div>
        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2.5">
            <CircleAlert className="w-4.5 h-4.5 shrink-0" />
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 disabled:opacity-70">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PackageSearch className="w-5 h-5" />}
          {loading ? "جارٍ البحث…" : "عرض الطلب"}
        </button>
      </form>

      {order && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-8 glass rounded-3xl overflow-hidden">
          <div className="px-7 py-5 border-b border-white/8 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-neon-400" />
                طلب <span className="font-latin">{order.orderNumber}</span>
              </p>
              <p className="text-[11px] text-ink-300 mt-1 font-latin">{new Date(order.createdAt).toLocaleString("en-GB")}</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 text-xs font-bold px-4 py-1.5">مدفوع ومسلَّم</span>
          </div>
          <ul className="divide-y divide-white/6">
            {order.items.map((item, i) => (
              <li key={i} className="px-7 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{item.productName}</p>
                  <p className="text-[11px] text-ink-300 font-latin mt-0.5">{formatSAR(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <code dir="ltr" className="rounded-lg bg-ink-950 border border-neon-400/25 px-3 py-2 font-latin text-xs tracking-wider text-neon-400">
                    {item.licenseKey}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.licenseKey);
                      toast.success("تم نسخ الكود");
                    }}
                    className="w-9 h-9 grid place-items-center rounded-lg btn-ghost"
                    aria-label="نسخ"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-7 py-4 border-t border-white/8 bg-white/[0.02] flex justify-between items-center">
            <span className="text-sm text-ink-300">الإجمالي</span>
            <span className="text-xl font-bold font-latin text-neon-400">{formatSAR(order.total)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
