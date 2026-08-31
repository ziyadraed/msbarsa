"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  ChevronDown,
} from "lucide-react";
import { MERCHANT_NAV, type NavGroup } from "./sidebar";

const TONES: Record<string, string> = {
  "الرئيسية": "from-sky-500/25 to-cyan-400/15 border-cyan-400/30 text-cyan-300",
  "الطلبات": "from-viol-500/25 to-fuchsia-400/15 border-viol-500/30 text-viol-300",
  "المنتجات": "from-emerald-500/25 to-teal-400/15 border-emerald-500/30 text-emerald-300",
  "التسويق": "from-amber-500/25 to-orange-400/15 border-amber-500/30 text-amber-300",
  "المتجر الإلكتروني": "from-pink-500/25 to-rose-400/15 border-pink-500/30 text-pink-300",
  "العملاء": "from-indigo-500/25 to-blue-400/15 border-indigo-500/30 text-indigo-300",
  "الموظفون": "from-sky-500/25 to-blue-400/15 border-sky-500/30 text-sky-300",
  "التقارير": "from-lime-500/25 to-green-400/15 border-lime-500/30 text-lime-300",
  "الشحن": "from-cyan-500/25 to-teal-400/15 border-cyan-500/30 text-cyan-300",
  "الدفع": "from-fuchsia-500/25 to-pink-400/15 border-fuchsia-500/30 text-fuchsia-300",
  "الأدوات المساعدة": "from-slate-500/25 to-gray-400/15 border-slate-500/30 text-slate-300",
  "الإعدادات": "from-rose-500/25 to-red-400/15 border-rose-500/30 text-rose-300",
  "السجلات": "from-zinc-500/25 to-neutral-400/15 border-zinc-500/30 text-zinc-300",
};

const ICONS: Record<string, any> = {
  "الرئيسية": LayoutDashboard,
  "الطلبات": ShoppingBag,
  "المنتجات": Package,
  "التسويق": Megaphone,
  "المتجر الإلكتروني": Store,
  "العملاء": Users,
  "الموظفون": UsersRound,
  "التقارير": BarChart3,
  "الشحن": Truck,
  "الدفع": CreditCard,
  "الأدوات المساعدة": Wrench,
  "الإعدادات": CreditCard,
  "السجلات": ScrollText,
};

const DESCS: Record<string, string> = {
  "الرئيسية": "المؤشرات والأداء",
  "الطلبات": "إدارة الطلبات والمرتجعات",
  "المنتجات": "المنتجات والمخزون والفئات",
  "التسويق": "الكوبونات والحملات",
  "المتجر الإلكتروني": "التصميم والدومين والصفحات",
  "العملاء": "العملاء والمجموعات",
  "الموظفون": "الفريق والأدوار والصلاحيات",
  "التقارير": "التحليلات والتقارير التفصيلية",
  "الشحن": "طرق وأسعار الشحن",
  "الدفع": "بوابات الدفع والضرائب",
  "الأدوات المساعدة": "تطبيقات وأدوات المطور",
  "الإعدادات": "إعدادات المتجر العامة",
  "السجلات": "سجل العمليات والتدقيق",
};

export default function MerchantSectionsMap() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MERCHANT_NAV.map((g) => [g.label, true]))
  );

  const toggle = (label: string) => setExpanded((s) => ({ ...s, [label]: !s[label] }));

  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="font-latin text-[11px] tracking-[0.4em] text-neon-400 mb-1">CONTROL CENTER</p>
          <h3 className="font-bold text-lg">خريطة أقسام المتجر</h3>
          <p className="text-xs text-ink-300 mt-1">اضغط على أي قسم لعرض جميع صفحاته، وانقر لفتحها مباشرة</p>
        </div>
        <Link href="/merchant/settings" className="btn-ghost rounded-2xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
          إعدادات سريعة <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {MERCHANT_NAV.map((group) => {
          const Icon = ICONS[group.label] ?? LayoutDashboard;
          const tone = TONES[group.label] ?? "from-slate-500/25 to-gray-400/15 border-slate-500/30 text-slate-300";
          const open = expanded[group.label] ?? true;
          const groupActive = group.href && (group.href === "/merchant" ? pathname === "/merchant" : pathname.startsWith(group.href));

          return (
            <div key={group.label} className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
              <div className="flex items-center gap-3">
                <Link
                  href={group.href ?? "#"}
                  className={`flex flex-1 items-center gap-3 p-4 transition-colors ${groupActive ? "bg-neon-400/5" : "hover:bg-white/3"}`}
                >
                  <span className={`grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br border shrink-0 ${tone}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${groupActive ? "text-neon-400" : ""}`}>{group.label}</p>
                    <p className="text-[11px] text-ink-300 mt-0.5 truncate">{DESCS[group.label] ?? "إدارة القسم"}</p>
                  </div>
                  {group.items.length > 0 && (
                    <button
                      onClick={(e) => { e.preventDefault(); toggle(group.label); }}
                      className="grid place-items-center w-8 h-8 rounded-xl text-ink-300 hover:text-neon-400 hover:bg-white/5 transition-colors"
                      aria-label={`${open ? "طيّ" : "توسيع"} ${group.label}`}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </Link>
              </div>

              {group.items.length > 0 && open && (
                <div className="border-t border-white/8 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                          active ? "text-neon-400 bg-neon-400/10" : "text-ink-300 hover:text-ink-100 hover:bg-white/5"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
