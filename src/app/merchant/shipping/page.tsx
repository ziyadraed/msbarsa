"use client";

import { useState } from "react";
import { Truck, Check } from "lucide-react";
import { toast } from "sonner";

const PROVIDERS = [
  { id: "smsa", name: "سمسا", desc: "شحن بري وجوي لجميع مناطق المملكة", fee: "من 20 ر.س" },
  { id: "aramex", name: "أرامكس", desc: "حلول شحن محلية ودولية", fee: "من 35 ر.س" },
  { id: "dhl", name: "DHL", desc: "توصيل دولي سريع", fee: "من 60 ر.س" },
  { id: "inhouse", name: "شحن ذاتي", desc: "التوصيل من داخل متجرك", fee: "حسب التكلفة" },
  { id: "digital", name: "تسليم رقمي فوري", desc: "للمنتجات الرقمية عبر البريد", fee: "مجاني" },
];

export default function ShippingProvidersPage() {
  const [active, setActive] = useState<string[]>(["digital", "inhouse"]);

  function toggle(id: string) {
    setActive((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
  }

  function save() {
    toast.success("تم تحديث شركات الشحن");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">شركات الشحن</h2>
          <p className="text-sm text-ink-300 mt-1">فعّل شركات الشحن التي يوفرها متجرك للعملاء</p>
        </div>
        <button onClick={save} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold">حفظ</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROVIDERS.map((p) => {
          const on = active.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`glass rounded-3xl p-5 text-right hover-lift ${on ? "ring-1 ring-emerald-400/40" : "opacity-80"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`grid place-items-center w-11 h-11 rounded-2xl border ${on ? "bg-emerald-400/15 border-emerald-400/30" : "bg-white/5 border-white/10"}`}>
                  <Truck className={`w-5 h-5 ${on ? "text-emerald-400" : "text-ink-300"}`} />
                </span>
                <span className={`relative w-10 h-5 rounded-full ${on ? "bg-emerald-500" : "bg-white/15"} transition-colors`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "right-0.5" : "right-5"}`} />
                </span>
              </div>
              <p className="font-bold flex items-center gap-2">{p.name} {on && <Check className="w-4 h-4 text-emerald-400" />}</p>
              <p className="text-xs text-ink-300 mt-1.5 leading-relaxed">{p.desc}</p>
              <p className="text-[11px] text-neon-400 mt-2 font-latin">{p.fee}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
