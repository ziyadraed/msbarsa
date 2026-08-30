import Link from "next/link";
import {
  Store, Coins, Languages, Wrench, Globe, Receipt, Bell, Contact, CreditCard, ChevronLeft, Crown,
  Landmark, Truck, Link2, Mail, Hash,
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
    { href: "/merchant/settings/translation", label: "الترجمة", icon: Hash, desc: "ترجمة نصوص المتجر" },
    { href: "/merchant/settings/custom-links", label: "الروابط المخصصة", icon: Link2, desc: "روابط قائمة المتجر" },
  ]},
  { title: "المالية والملكية", items: [
    { href: "/merchant/settings/bank", label: "الحساب البنكي", icon: Landmark, desc: "بيانات التحويل البنكي" },
    { href: "/merchant/settings/customs-fees", label: "الرسوم الجمركية", icon: Truck, desc: "رسوم الطلبات الدولية" },
    { href: "/merchant/payments/tax", label: "الضرائب", icon: Receipt, desc: "نسبة الضريبة والرقم الضريبي" },
  ]},
  { title: "العمليات", items: [
    { href: "/merchant/settings/subdomain", label: "الدومين الفرعي", icon: Globe, desc: "رابط المتجر المجاني" },
    { href: "/merchant/settings/domain-email", label: "بريد الدومين", icon: Mail, desc: "عناوين بريد مخصصة" },
    { href: "/merchant/store/domain", label: "الدومين", icon: CreditCard, desc: "الدومين المخصص" },
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
