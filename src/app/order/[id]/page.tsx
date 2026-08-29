"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Copy, KeyRound, PackageSearch, Loader2, ArrowLeft, MailWarning } from "lucide-react";
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

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderNumber = decodeURIComponent(id).toUpperCase();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let email: string | null = null;
    try {
      const raw = sessionStorage.getItem(`msbar_order_${orderNumber}`);
      if (raw) email = JSON.parse(raw).email;
    } catch {
      /* ignore */
    }
    if (!email) {
      setBlocked(true);
      setLoading(false);
      return;
    }
    fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, email }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setOrder(d.order))
      .catch(() => setBlocked(true))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const copyAll = () => {
    if (!order) return;
    const text = order.items.map((i) => `${i.productName}: ${i.licenseKey}`).join("\n");
    navigator.clipboard.writeText(text).then(() => toast.success("تم نسخ جميع الأكواد"));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-400" />
      </div>
    );
  }

  if (blocked || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <div className="mx-auto w-20 h-20 rounded-3xl glass grid place-items-center mb-7">
          <MailWarning className="w-9 h-9 text-gold" />
        </div>
        <h1 className="text-3xl font-bold">تحقق من طلبك</h1>
        <p className="text-ink-300 mt-4 leading-8">
          لعرض مفاتيح الطلب نحتاج التحقق من ملكيته. أدخل رقم الطلب <span className="font-latin text-neon-400">{orderNumber}</span> مع
          البريد المستخدم وقت الشراء في صفحة تتبع الطلب.
        </p>
        <Link href="/track" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold mt-8">
          <PackageSearch className="w-4.5 h-4.5" />
          تتبع الطلب
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 18, stiffness: 220 }} className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", damping: 12, stiffness: 200 }}
          className="mx-auto w-24 h-24 rounded-full bg-emerald-400/15 border-2 border-emerald-400/60 grid place-items-center mb-7"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </motion.div>
        <p className="font-latin text-xs tracking-[0.4em] text-emerald-400 mb-3">ORDER CONFIRMED</p>
        <h1 className="text-4xl sm:text-5xl font-bold">تم الدفع بنجاح</h1>
        <p className="text-ink-300 mt-4 leading-8">
          شكرًا لك {order.customerName.split(" ")[0]} — طلبك <span className="font-latin text-neon-400 font-semibold">{order.orderNumber}</span> مكتمل،
          وأكواد التفعيل جاهزة أدناه. نسخة احتياطية مرتبطة ببريدك <span className="font-latin">{order.email}</span>.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 glass rounded-3xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-7 py-5 border-b border-white/8 bg-white/[0.02]">
          <span className="flex items-center gap-2.5 font-bold">
            <KeyRound className="w-5 h-5 text-neon-400" />
            مفاتيح التفعيل الفورية
          </span>
          <button onClick={copyAll} className="btn-ghost rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <Copy className="w-3.5 h-3.5" />
            نسخ الكل
          </button>
        </div>
        <ul className="divide-y divide-white/6">
          {order.items.map((item, i) => (
            <li key={i} className="px-7 py-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">{item.productName}</p>
                <p className="text-[11px] text-ink-300 font-latin mt-1">{formatSAR(item.price)}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <code dir="ltr" className="rounded-xl bg-ink-950 border border-neon-400/25 px-4 py-2.5 font-latin text-sm tracking-wider text-neon-400">
                  {item.licenseKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.licenseKey);
                    toast.success("تم نسخ الكود");
                  }}
                  className="w-10 h-10 grid place-items-center rounded-xl btn-ghost"
                  aria-label="نسخ الكود"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-7 py-5 border-t border-white/8 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-ink-300">إجمالي الطلب</span>
          <span className="text-2xl font-bold font-latin text-gradient">{formatSAR(order.total)}</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link href="/track" className="btn-ghost rounded-2xl py-4 text-center font-semibold flex items-center justify-center gap-2">
          <PackageSearch className="w-4.5 h-4.5" />
          عرض الطلب لاحقًا
        </Link>
        <Link href="/shop" className="btn-primary rounded-2xl py-4 text-center font-bold flex items-center justify-center gap-2">
          متابعة التسوق
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
