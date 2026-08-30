import Link from "next/link";
import {
  Store, Coins, Languages, Wrench, Globe, Receipt, Bell, Contact, CreditCard, ChevronLeft, Crown,
} from "lucide-react";

// Unified settings center — single access point to all store settings groups.
const GROUPS = [
  { title: "عام", items: [
    { href: "/merchant/settings", label: "بيانات المتجر", icon: Store, desc: "الاسم والبريد والجوال" },
    { href: "/merchant/settings/contact", label: "قنوات التواصل", icon: Contact, desc: "منصات التواصل والبريد" },
    { href: "/merchant/settings/plan", label: "الباقة والاشتراك", icon: Crown, desc: "خطط الأسعار" },
  ]},
  { title: "الظهور", items: [
    { href: "/merchant/settings/languages", label: "لغات المتجر", icon: Languages, desc: "اللغات واللغة الافتراضية" },
    { href: "/merchant/settings/currencies", label: "العملات", icon: Coins, desc: "العملات والعملة الافتراضية" },
    { href: "/merchant/settings/maintenance", label: "وضع الصيانة", icon: Wrench, desc: "إيقاف المتجر مؤقتًا" },
    { href: "/merchant/settings/notifications", label: "الإشعارات", icon: Bell, desc: "تفضيلات التنبيهات" },
  ]},
  { title: "العمليات", items: [
    { href: "/merchant/payments/tax", label: "الضرائب", icon: Receipt, desc: "نسبة الضريبة والرقم الضريبي" },
    { href: "/merchant/store/domain", label: "الدومين", icon: Globe, desc: "رابط المتجر والدومين المخصص" },
    { href: "/merchant/shipping/settings", label: "الشحن", icon: CreditCard, desc: "طرق وأسعار الشحن" },
  ]},
];

export const metadata = { title: "مركز الإعدادات الموحد" };

export default function SettingsHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">مركز الإعدادات الموحد</h2>
        <p className="text-sm text-ink-300 mt-1">نقطة وصول واحدة لإدارة جميع إعدادات متجرك</p>
      </div>

      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="text-xs text-ink-300 font-semibold mb-3">{g.title}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {g.items.map((it) => (
              <Link key={it.href} href={it.href} className="glass rounded-2xl p-4 flex items-center gap-3 hover-lift group">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-neon-500/20 to-viol-500/15 border border-white/10 shrink-0">
                  <it.icon className="w-5 h-5 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold group-hover:text-neon-400 transition-colors">{it.label}</p>
                  <p className="text-[11px] text-ink-300 truncate">{it.desc}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-ink-300 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
