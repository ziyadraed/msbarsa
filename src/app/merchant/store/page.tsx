import Link from "next/link";
import { Palette, Palette as Themes, Globe, FileText, Rocket, ChevronLeft } from "lucide-react";

const ITEMS = [
  { href: "/merchant/store/design", title: "تصميم المتجر", desc: "الشعار واللون والإعلان", icon: Palette },
  { href: "/merchant/store/themes", title: "الثيمات", desc: "اختر هوية المتجر", icon: Themes },
  { href: "/merchant/store/domain", title: "الدومين", desc: "رابط المتجر والدومين المخصص", icon: Globe },
  { href: "/merchant/store/pages", title: "الصفحات التعريفية", desc: "من نحن، الشروط...", icon: FileText },
  { href: "/merchant/store/landing", title: "صفحات الهبوط", desc: "صفحات الحملات التسويقية", icon: Rocket },
];

export const metadata = { title: "المتجر الإلكتروني" };

export default function StoreSectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">المتجر الإلكتروني</h2>
        <p className="text-sm text-ink-300 mt-1">خصّص متجرك وهويته ودومينه</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((it) => (
          <Link key={it.href} href={it.href} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift group">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/20 to-viol-500/15 border border-white/10">
              <it.icon className="w-5 h-5 text-neon-400" />
            </span>
            <div className="flex-1">
              <p className="font-bold group-hover:text-neon-400 transition-colors">{it.title}</p>
              <p className="text-xs text-ink-300 mt-1">{it.desc}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-ink-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
