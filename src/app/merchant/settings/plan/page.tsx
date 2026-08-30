"use client";

import { useEffect, useState } from "react";
import { Crown, Loader2, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  { id: "free", name: "مجاني", price: "0", desc: "ابدأ متجرك الأساسي", features: ["حتى 20 منتج", "دومين فرعي", "كوبونات أساسية"] },
  { id: "plus", name: "باقة بلس", price: "49", desc: "للمتاجر النامية", features: ["منتجات غير محدودة", "إدارة العملاء", "تقارير تفصيلية", "تصدير البيانات"] },
  { id: "pro", name: "باقة برو", price: "99", desc: "للمتاجر المحترفة", features: ["كل مزايا بلس", "فريق حتى 10 موظفين", "5 فروع مستقلة", "أدوات المطور API"] },
];

export default function PlanPage() {
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState("free");

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) setCurrent(d.store.plan ?? "free");
    }).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">باقة واشتراك المتجر</h2>
        <p className="text-sm text-ink-300 mt-1">باقتك الحالية: <span className="font-bold text-neon-400">{PLANS.find((p) => p.id === current)?.name ?? current}</span></p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const active = current === p.id;
            return (
              <div key={p.id} className={`glass rounded-3xl p-6 flex flex-col gap-4 hover-lift ${active ? "ring-2 ring-neon-400/60" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/20 to-viol-500/15 border border-white/10">
                    {p.id === "pro" ? <Crown className="w-5 h-5 text-gold" /> : <Sparkles className="w-5 h-5 text-neon-400" />}
                  </span>
                  {active && <span className="text-[10px] px-2 py-1 rounded-full bg-neon-400/15 text-neon-400 border border-neon-400/30">الباقة الحالية</span>}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-xs text-ink-300 mt-0.5">{p.desc}</p>
                </div>
                <p className="font-latin font-bold text-2xl">{p.price} <span className="text-xs text-ink-300">ر.س/شهر</span></p>
                <ul className="space-y-2 text-xs text-ink-200 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {f}</li>
                  ))}
                </ul>
                <button
                  disabled={active}
                  onClick={() => toast.info("ترقية الباقة — سيتوفر الدفع قريبًا")}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${active ? "bg-white/5 border border-white/10 text-ink-300 cursor-default" : "btn-primary"}`}
                >
                  {active ? "باقتك الحالية" : `ترقية إلى ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
