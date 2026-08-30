"use client";

import { ShoppingCart, BellRing, Mail, MessageSquare } from "lucide-react";

export default function AbandonedCartsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">السلات المتروكة</h2>
        <p className="text-sm text-ink-300 mt-1">استرجع العملاء الذين أضافوا منتجات ولم يكملوا الشراء</p>
      </div>

      <div className="glass rounded-3xl p-10 text-center">
        <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-500/20 to-viol-500/20 border border-white/10 mb-5">
          <ShoppingCart className="w-8 h-8 text-neon-400" />
        </span>
        <h3 className="text-lg font-bold mb-2">لا سلات متروكة بعد</h3>
        <p className="text-sm text-ink-300 leading-7 max-w-md mx-auto">
          عندما يضيف العميل منتجات إلى سلته ويغادر دون إتمام الشراء، تظهر هنا لإرسال تذكيرات تلقائية لاسترجاعه.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, title: "تذكير بالبريد", desc: "بريد تلقائي بعد ساعة" },
          { icon: MessageSquare, title: "رسالة واتساب", desc: "تذكير عبر الجوال" },
          { icon: BellRing, title: "عرض خصم", desc: "كوبون يحفّز الإتمام" },
        ].map((f) => (
          <div key={f.title} className="glass rounded-3xl p-5 text-center">
            <span className="mx-auto grid place-items-center w-11 h-11 rounded-2xl bg-white/5 mb-3"><f.icon className="w-5 h-5 text-neon-400" /></span>
            <p className="font-bold text-sm">{f.title}</p>
            <p className="text-xs text-ink-300 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
