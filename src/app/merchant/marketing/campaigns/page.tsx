"use client";

import { useEffect, useState } from "react";
import { Megaphone, Tag, RefreshCw, TrendingUp, Percent, ShoppingBag, Loader2 } from "lucide-react";

type Coupon = { id: string; code: string; type: string; value: number; used: number; maxUses: number | null; active: boolean };

export default function CampaignsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/merchant/coupons");
        const d = await r.json();
        setCoupons(d.coupons ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = coupons.filter((c) => c.active);
  const totalUses = coupons.reduce((s, c) => s + c.used, 0);

  const cards = [
    { label: "الحملات النشطة", value: String(active.length), icon: Megaphone, tint: "text-neon-400 bg-neon-400/10 border-neon-400/25" },
    { label: "إجمالي الاستخدامات", value: String(totalUses), icon: ShoppingBag, tint: "text-viol-400 bg-viol-500/10 border-viol-500/25" },
    { label: "نسبة استخدام", value: coupons.length ? `${Math.round((totalUses / Math.max(coupons.length, 1)) * 10)}%` : "0%", icon: Percent, tint: "text-amber-400 bg-amber-400/10 border-amber-400/25" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الحملات التسويقية</h2>
          <p className="text-sm text-ink-300 mt-1">أداء كوبوناتك وحملات الخصم</p>
        </div>
        <button onClick={() => setLoading(false)} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {loading ? (
        <div className="glass rounded-3xl p-14 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.label} className="glass rounded-3xl p-5">
                <span className={`grid place-items-center w-11 h-11 rounded-2xl border ${c.tint} mb-4`}><c.icon className="w-5 h-5" /></span>
                <p className="font-latin font-bold text-2xl">{c.value}</p>
                <p className="text-xs text-ink-300 mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <p className="text-xs text-ink-300">كوبونات الخصم ({coupons.length})</p>
            </div>
            {coupons.length === 0 ? (
              <div className="p-12 text-center text-ink-300 text-sm">لا كوبونات بعد — أنشئ حملة خصم من قسم التسويق</div>
            ) : (
              <div className="divide-y divide-white/5">
                {coupons.map((c) => (
                  <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                    <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0"><Tag className="w-5 h-5 text-neon-400" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-latin font-bold text-sm">{c.code}</p>
                      <p className="text-[11px] text-ink-300">
                        {c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? `${c.value} ر.س` : "شحن مجاني"}
                        {c.maxUses ? ` · ${c.used}/${c.maxUses}` : ` · استخدم ${c.used}`}
                      </p>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${c.active ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-white/5 text-ink-300 border-white/10"}`}>
                      {c.active ? "نشطة" : "موقوفة"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
