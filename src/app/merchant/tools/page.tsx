import Link from "next/link";
import { LayoutGrid, Code2, ChevronLeft } from "lucide-react";

const ITEMS = [
  { href: "/merchant/tools/apps", title: "متجر التطبيقات", desc: "وسّع قدرات متجرك", icon: LayoutGrid },
  { href: "/merchant/tools/developer", title: "أدوات المطور", desc: "مفاتيح API والدمج", icon: Code2 },
];

export const metadata = { title: "الأدوات المساعدة" };

export default function ToolsSectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">الأدوات المساعدة</h2>
        <p className="text-sm text-ink-300 mt-1">تطبيقات وأدوات لزيادة كفاءة متجرك</p>
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
