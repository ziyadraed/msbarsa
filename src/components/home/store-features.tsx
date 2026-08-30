import { Truck, ShieldCheck, Headset, CreditCard, RefreshCcw } from "lucide-react";

// Salla-style trust/feature strip rendered on the storefront.
const FEATURES = [
  {
    icon: Truck,
    title: "تسليم فوري",
    text: "استلام فوري للمنتجات الرقمية عبر بريدك الإلكتروني",
  },
  {
    icon: ShieldCheck,
    title: "ضمان الأصالة",
    text: "منتجات أصلية 100% بتراخيص موثوقة ورسمية",
  },
  {
    icon: CreditCard,
    title: "دفع آمن",
    text: "بوابات دفع محلية وآمنة لتجربة شراء مطمئنة",
  },
  {
    icon: RefreshCcw,
    title: "إرجاع سهل",
    text: "دعم فني متواصل وضمان استرداد خلال الفترة المحددة",
  },
];

export default function StoreFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="glass rounded-3xl p-6 flex flex-col gap-3 hover-lift">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-500/20 to-viol-500/20 border border-white/10">
              <f.icon className="w-6 h-6 text-neon-400" />
            </span>
            <h3 className="font-bold text-sm">{f.title}</h3>
            <p className="text-xs text-ink-300 leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
