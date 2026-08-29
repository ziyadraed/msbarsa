"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, ShieldCheck, Zap, RotateCcw } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import ProductArt from "@/components/store/product-art";
import { formatSAR, discountPct } from "@/lib/utils";

export default function CartPage() {
  const cart = useCart();
  const saved = cart.items.reduce((s, i) => s + ((i.comparePrice ?? i.price) - i.price) * i.qty, 0);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <div className="mx-auto w-24 h-24 rounded-[2rem] glass grid place-items-center mb-8">
          <ShoppingBag className="w-11 h-11 text-ink-300" />
        </div>
        <h1 className="text-3xl font-bold">سلتك فارغة</h1>
        <p className="text-ink-300 mt-4 leading-8">لم تضف أي تراخيص بعد — تصفح المتجر واختر ما يناسب جهازك.</p>
        <Link href="/shop" className="btn-primary inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 font-bold mt-8">
          تصفح المتجر
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">CART</p>
      <h1 className="text-4xl sm:text-5xl font-bold mb-10">سلة المشتريات</h1>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
        <ul className="space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => {
              const pct = discountPct(item.price, item.comparePrice);
              return (
                <motion.li
                  key={item.slug}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="glass rounded-3xl p-4 flex gap-5 items-center"
                >
                  <Link href={`/product/${item.slug}`} className="relative w-28 sm:w-36 aspect-[16/10] rounded-2xl overflow-hidden shrink-0 border border-white/8">
                    <ProductArt category={item.categorySlug} latin={item.latinName} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/product/${item.slug}`} className="font-bold hover:text-neon-400 transition-colors">{item.name}</Link>
                        <p className="font-latin text-[11px] text-ink-300 mt-1">{item.latinName}</p>
                      </div>
                      <button onClick={() => cart.remove(item.slug)} className="text-ink-300 hover:text-red-400 transition-colors shrink-0" aria-label="حذف من السلة">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1 rounded-xl border border-white/10 overflow-hidden">
                        <button onClick={() => cart.setQty(item.slug, item.qty - 1)} className="w-9 h-9 grid place-items-center hover:bg-white/5" aria-label="تقليل">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-9 text-center font-latin font-bold">{item.qty}</span>
                        <button onClick={() => cart.setQty(item.slug, item.qty + 1)} className="w-9 h-9 grid place-items-center hover:bg-white/5" aria-label="زيادة">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-end">
                        <p className="text-neon-400 font-bold text-lg font-latin">{formatSAR(item.price * item.qty)}</p>
                        {pct > 0 && (
                          <p className="text-[11px] text-ink-300">
                            <span className="line-through font-latin">{formatSAR((item.comparePrice ?? 0) * item.qty)}</span>
                            <span className="ms-2 text-lime-pop font-latin">وفّرت {pct}%</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* summary */}
        <aside className="glass rounded-3xl p-7 lg:sticky lg:top-28">
          <h2 className="font-bold text-xl mb-6">ملخص الطلب</h2>
          <dl className="space-y-3.5 text-sm">
            <div className="flex justify-between text-ink-200">
              <dt>المجموع الفرعي ({cart.count} منتجًا)</dt>
              <dd className="font-latin">{formatSAR(cart.subtotal)}</dd>
            </div>
            {saved > 0 && (
              <div className="flex justify-between text-emerald-400">
                <dt>توفيرك من العروض</dt>
                <dd className="font-latin">-{formatSAR(saved)}</dd>
              </div>
            )}
            <div className="flex justify-between text-ink-200">
              <dt>رسوم التسليم الرقمي</dt>
              <dd className="text-emerald-400 font-semibold">مجانًا</dd>
            </div>
            <div className="border-t border-white/10 pt-4 mt-2 flex justify-between items-end">
              <dt className="font-bold">الإجمالي</dt>
              <dd className="text-3xl font-bold font-latin text-gradient">{formatSAR(cart.subtotal)}</dd>
            </div>
          </dl>

          <Link href="/checkout" className="btn-primary w-full mt-7 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            متابعة للدفع
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link href="/shop" className="btn-ghost w-full mt-3 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            متابعة التسوق
          </Link>

          <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] text-ink-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> دفع آمن ومشفر 100%</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-neon-400 shrink-0" /> تسليم الأكواد فوري</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
