import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Megaphone,
  Store,
  Users,
  UsersRound,
  BarChart3,
  Truck,
  CreditCard,
  Wrench,
  ScrollText,
  ArrowLeft,
} from "lucide-react";

// Navigation map shown at the top of the merchant dashboard so the merchant
// can jump to every section of the store in one glance.
const SECTIONS = [
  { href: "/merchant", label: "نظرة عامة", desc: "المؤشرات والأداء", icon: LayoutDashboard, tone: "from-sky-500/25 to-cyan-400/15 border-cyan-400/30 text-cyan-300" },
  { href: "/merchant/orders", label: "الطلبات", desc: "إدارة الطلبات والمرتجعات", icon: ShoppingBag, tone: "from-viol-500/25 to-fuchsia-400/15 border-viol-500/30 text-viol-300" },
  { href: "/merchant/products", label: "المنتجات", desc: "المنتجات والمخزون والفئات", icon: Package, tone: "from-emerald-500/25 to-teal-400/15 border-emerald-500/30 text-emerald-300" },
  { href: "/merchant/marketing", label: "التسويق", desc: "الكوبونات والحملات", icon: Megaphone, tone: "from-amber-500/25 to-orange-400/15 border-amber-500/30 text-amber-300" },
  { href: "/merchant/store", label: "المتجر الإلكتروني", desc: "التصميم والدومين والصفحات", icon: Store, tone: "from-pink-500/25 to-rose-400/15 border-pink-500/30 text-pink-300" },
  { href: "/merchant/customers", label: "العملاء", desc: "العملاء والمجموعات", icon: Users, tone: "from-indigo-500/25 to-blue-400/15 border-indigo-500/30 text-indigo-300" },
  { href: "/merchant/staff", label: "الموظفون", desc: "الفريق والأدوار والصلاحيات", icon: UsersRound, tone: "from-sky-500/25 to-blue-400/15 border-sky-500/30 text-sky-300" },
  { href: "/merchant/analytics", label: "التقارير", desc: "التحليلات والتقارير التفصيلية", icon: BarChart3, tone: "from-lime-500/25 to-green-400/15 border-lime-500/30 text-lime-300" },
  { href: "/merchant/shipping", label: "الشحن", desc: "طرق وأسعار الشحن", icon: Truck, tone: "from-cyan-500/25 to-teal-400/15 border-cyan-500/30 text-cyan-300" },
  { href: "/merchant/payments", label: "الدفع", desc: "بوابات الدفع والضرائب", icon: CreditCard, tone: "from-fuchsia-500/25 to-pink-400/15 border-fuchsia-500/30 text-fuchsia-300" },
  { href: "/merchant/tools", label: "الأدوات المساعدة", desc: "تطبيقات وأدوات المطور", icon: Wrench, tone: "from-slate-500/25 to-gray-400/15 border-slate-500/30 text-slate-300" },
  { href: "/merchant/settings", label: "الإعدادات", desc: "إعدادات المتجر العامة", icon: CreditCard, tone: "from-rose-500/25 to-red-400/15 border-rose-500/30 text-rose-300" },
  { href: "/merchant/logs", label: "السجلات", desc: "سجل العمليات والتدقيق", icon: ScrollText, tone: "from-zinc-500/25 to-neutral-400/15 border-zinc-500/30 text-zinc-300" },
];

export default function MerchantSectionsMap() {
  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="font-latin text-[11px] tracking-[0.4em] text-neon-400 mb-1">CONTROL CENTER</p>
          <h3 className="font-bold text-lg">خريطة أقسام المتجر</h3>
          <p className="text-xs text-ink-300 mt-1">تنقّل بين جميع أقسام إدارة متجرك من مكان واحد</p>
        </div>
        <Link href="/merchant/settings" className="btn-ghost rounded-2xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
          إعدادات سريعة <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-white/8 bg-white/2 p-4 hover:border-neon-400/40 hover:bg-white/4 transition-colors"
          >
            <span className={`grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br border ${s.tone} mb-3`}>
              <s.icon className="w-5 h-5" />
            </span>
            <p className="text-sm font-bold group-hover:text-neon-400 transition-colors">{s.label}</p>
            <p className="text-[11px] text-ink-300 mt-1 leading-snug">{s.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
