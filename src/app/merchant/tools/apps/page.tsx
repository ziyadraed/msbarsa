"use client";

import { useState } from "react";
import { Box, Mail, BarChart3, Megaphone, Wallet, Headset, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const APPS = [
  { id: "analytics", name: "التحليلات المتقدمة", desc: "تقارير تفصيلية ونظرة معمّقة على المبيعات", icon: BarChart3, tag: "تقارير" },
  { id: "email", name: "التسويق بالبريد", desc: "حملات بريدية وتنبيهات تلقائية للعملاء", icon: Mail, tag: "تسويق" },
  { id: "campaigns", name: "الحملات الترويجية", desc: "أنشئ عروضًا وخصومات ذكية", icon: Megaphone, tag: "تسويق" },
  { id: "wallet", name: "المحفظة الرقمية", desc: "إدارة أرصدتك وسحوباتك", icon: Wallet, tag: "مدفوعات" },
  { id: "support", name: "الدعم الفني", desc: "تذاكر ودعم مباشر للعملاء", icon: Headset, tag: "خدمة" },
  { id: "inventory", name: "إدارة المخزون المتقدم", desc: "تنبيهات وتقارير جرد ذكية", icon: Box, tag: "منتجات" },
];

export default function AppsPage() {
  const [installed, setInstalled] = useState<string[]>(["analytics", "wallet"]);

  function toggle(id: string) {
    setInstalled((prev) => {
      const on = prev.includes(id);
      toast.success(on ? "تم إلغاء تثبيت التطبيق" : "تم تثبيت التطبيق");
      return on ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">متجر التطبيقات</h2>
        <p className="text-sm text-ink-300 mt-1">وسّع قدرات متجرك بتطبيقات مسبار</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {APPS.map((a) => {
          const on = installed.includes(a.id);
          return (
            <div key={a.id} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift">
              <div className="flex items-start justify-between">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-500/20 to-viol-500/15 border border-white/10">
                  <a.icon className="w-6 h-6 text-neon-400" />
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">{a.tag}</span>
              </div>
              <div>
                <p className="font-bold">{a.name}</p>
                <p className="text-xs text-ink-300 mt-1.5 leading-relaxed">{a.desc}</p>
              </div>
              <button
                onClick={() => toggle(a.id)}
                className={`rounded-2xl px-4 py-2.5 text-xs font-bold mt-auto flex items-center justify-center gap-2 ${on ? "bg-white/5 border border-white/10 text-ink-300" : "btn-primary"}`}
              >
                {on ? (<><Check className="w-4 h-4" /> مثبّت</>) : (<><ExternalLink className="w-4 h-4" /> تثبيت</>)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
