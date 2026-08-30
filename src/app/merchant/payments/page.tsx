"use client";

import { useState } from "react";
import { CreditCard, Smartphone, Landmark, Check } from "lucide-react";
import { toast } from "sonner";

const GATEWAYS = [
  { id: "mada", name: "مدى", desc: "المدفوعات المحلية عبر البطاقة البنكية", icon: Landmark },
  { id: "visa_master", name: "Visa / Mastercard", desc: "البطاقات الائتمانية والمدينة", icon: CreditCard },
  { id: "apple_pay", name: "Apple Pay", desc: "الدفع عبر الهواتف الذكية", icon: Smartphone },
  { id: "cash", name: "الدفع عند الاستلام", desc: "نقدي عند وصول الطلب", icon: Landmark },
];

export default function PaymentsPage() {
  const [active, setActive] = useState<string[]>(["mada", "visa_master", "apple_pay"]);

  function toggle(id: string) {
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">طرق الدفع</h2>
          <p className="text-sm text-ink-300 mt-1">فعّل بوابات الدفع المتاحة في متجرك</p>
        </div>
        <button onClick={() => toast.success("تم تحديث طرق الدفع")} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold">حفظ</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GATEWAYS.map((g) => {
          const on = active.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={`glass rounded-3xl p-5 text-right hover-lift ${on ? "ring-1 ring-emerald-400/40" : "opacity-80"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`grid place-items-center w-11 h-11 rounded-2xl border ${on ? "bg-emerald-400/15 border-emerald-400/30" : "bg-white/5 border-white/10"}`}>
                  <g.icon className={`w-5 h-5 ${on ? "text-emerald-400" : "text-ink-300"}`} />
                </span>
                <span className={`relative w-10 h-5 rounded-full ${on ? "bg-emerald-500" : "bg-white/15"} transition-colors`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "right-0.5" : "right-5"}`} />
                </span>
              </div>
              <p className="font-bold flex items-center gap-2">{g.name} {on && <Check className="w-4 h-4 text-emerald-400" />}</p>
              <p className="text-xs text-ink-300 mt-1.5 leading-relaxed">{g.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
