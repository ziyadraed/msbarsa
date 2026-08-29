"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingBag, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatSAR } from "@/lib/utils";

export default function CartDrawer() {
  const cart = useCart();

  return (
    <AnimatePresence>
      {cart.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
          onClick={() => cart.setOpen(false)}
        >
          <motion.aside
            initial={{ x: -420 }}
            animate={{ x: 0 }}
            exit={{ x: -420 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute top-0 bottom-0 left-0 w-full max-w-[420px] bg-ink-900 border-e border-white/8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <h2 className="text-lg font-bold flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-neon-400" />
                سلة المشتريات
                <span className="font-latin text-xs text-ink-300">({cart.count})</span>
              </h2>
              <button onClick={() => cart.setOpen(false)} className="w-10 h-10 grid place-items-center rounded-xl btn-ghost" aria-label="إغلاق السلة">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.items.length === 0 ? (
                <div className="h-full grid place-items-center text-center">
                  <div>
                    <div className="mx-auto w-20 h-20 rounded-3xl glass grid place-items-center mb-5">
                      <ShoppingBag className="w-9 h-9 text-ink-300" />
                    </div>
                    <p className="font-semibold text-lg">سلتك فارغة</p>
                    <p className="text-sm text-ink-300 mt-1.5 mb-6">اكتشف تراخيص أصلية بأسعار منافسة</p>
                    <Link href="/shop" onClick={() => cart.setOpen(false)} className="btn-primary inline-flex px-6 py-3 rounded-2xl text-sm font-bold">
                      تصفح المتجر
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.items.map((item) => (
                    <motion.li key={item.slug} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link href={`/product/${item.slug}`} onClick={() => cart.setOpen(false)} className="font-semibold text-sm hover:text-neon-400 transition-colors">
                                {item.name}
                              </Link>
                              <p className="font-latin text-[11px] text-ink-300 mt-0.5">{item.latinName}</p>
                            </div>
                            <button onClick={() => cart.remove(item.slug)} className="text-ink-300 hover:text-red-400 transition-colors" aria-label="حذف">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 rounded-xl border border-white/10 overflow-hidden">
                              <button onClick={() => cart.setQty(item.slug, item.qty - 1)} className="w-8 h-8 grid place-items-center hover:bg-white/5" aria-label="تقليل">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-latin text-sm font-semibold">{item.qty}</span>
                              <button onClick={() => cart.setQty(item.slug, item.qty + 1)} className="w-8 h-8 grid place-items-center hover:bg-white/5" aria-label="زيادة">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-end">
                              <span className="text-neon-400 font-bold text-sm">{formatSAR(item.price * item.qty)}</span>
                              {item.comparePrice && (
                                <span className="block text-[11px] text-ink-300 line-through">{formatSAR(item.comparePrice * item.qty)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-ink-200">المجموع</span>
                  <span className="text-2xl font-bold text-gradient font-latin">{formatSAR(cart.subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => cart.setOpen(false)}
                  className="btn-primary w-full py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2"
                >
                  إتمام الشراء
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-center gap-5 text-[11px] text-ink-300">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> دفع آمن ومشفر</span>
                  <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-neon-400" /> تسليم فوري</span>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
