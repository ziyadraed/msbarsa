"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, Package, Users, Megaphone, BarChart3, Settings, Store,
  ChevronDown, Truck, CreditCard, Wrench, FileClock, Globe, MapPin, ArrowRight, Wallet,
  TrendingUp, UserCog, Shield, Tags, Boxes, Layers, Repeat, Download, Boxes as Stock,
} from "lucide-react";

export type NavItem = { href: string; label: string };
export type NavGroup = { label: string; icon: any; items: NavItem[]; href?: string };

export const MERCHANT_NAV: NavGroup[] = [
  { label: "الرئيسية", icon: LayoutDashboard, href: "/merchant", items: [] },
  {
    label: "الطلبات", icon: ShoppingBag, href: "/merchant/orders",
    items: [
      { href: "/merchant/orders", label: "إدارة الطلبات" },
      { href: "/merchant/orders/new", label: "طلب يدوي" },
      { href: "/merchant/orders/refunds", label: "المرتجعات والاسترداد" },
      { href: "/merchant/orders/templates", label: "قوالب التصدير" },
    ],
  },
  {
    label: "المنتجات", icon: Package, href: "/merchant/products",
    items: [
      { href: "/merchant/products", label: "إدارة المنتجات" },
      { href: "/merchant/products/inventory", label: "إدارة المخزون" },
      { href: "/merchant/products/transfers", label: "نقل المخزون" },
      { href: "/merchant/products/variants", label: "خيارات المنتج" },
      { href: "/merchant/products/categories", label: "التصنيفات والخيارات" },
      { href: "/merchant/products/brands", label: "الماركات والعلامات" },
      { href: "/merchant/products/import", label: "الاستيراد والتصدير" },
      { href: "/merchant/products/stores", label: "الفروع والمستودعات" },
    ],
  },
  {
    label: "التسويق", icon: Megaphone, href: "/merchant/marketing",
    items: [
      { href: "/merchant/marketing", label: "الكوبونات" },
      { href: "/merchant/marketing/campaigns", label: "الحملات التسويقية" },
      { href: "/merchant/marketing/abandoned", label: "السلات المتروكة" },
      { href: "/merchant/marketing/seo", label: "تحسين محركات البحث" },
      { href: "/merchant/marketing/loyalty", label: "نظام ولاء العملاء" },
      { href: "/merchant/marketing/affiliate", label: "التسويق بالعمولة" },
      { href: "/merchant/marketing/gifting", label: "نظام الإهداء" },
    ],
  },
  {
    label: "المتجر الإلكتروني", icon: Store, href: "/merchant/store",
    items: [
      { href: "/merchant/store/design", label: "تصميم المتجر" },
      { href: "/merchant/store/themes", label: "متجر الثيمات" },
      { href: "/merchant/store/domain", label: "دومين المتجر" },
      { href: "/merchant/store/pages", label: "الصفحات التعريفية" },
      { href: "/merchant/store/landing", label: "صفحات الهبوط" },
    ],
  },
  {
    label: "العملاء", icon: Users, href: "/merchant/customers",
    items: [
      { href: "/merchant/customers", label: "إدارة العملاء" },
      { href: "/merchant/customers/groups", label: "إدارة المجموعات" },
      { href: "/merchant/customers/import", label: "استيراد العملاء" },
      { href: "/merchant/customers/messages", label: "رسائل العملاء" },
    ],
  },
  {
    label: "الموظفون", icon: UserCog, href: "/merchant/staff",
    items: [
      { href: "/merchant/staff", label: "إدارة الموظفين" },
      { href: "/merchant/staff/roles", label: "الأدوار الوظيفية" },
    ],
  },
  {
    label: "التقارير", icon: BarChart3, href: "/merchant/analytics",
    items: [
      { href: "/merchant/analytics", label: "أداء المتجر" },
      { href: "/merchant/analytics/reports", label: "التقارير التفصيلية" },
    ],
  },
  {
    label: "الشحن", icon: Truck, href: "/merchant/shipping",
    items: [
      { href: "/merchant/shipping", label: "شركات الشحن" },
      { href: "/merchant/shipping/settings", label: "إعدادات الشحن" },
      { href: "/merchant/shipping/labels", label: "أرشيف البوليصات" },
    ],
  },
  {
    label: "الدفع", icon: CreditCard, href: "/merchant/payments",
    items: [
      { href: "/merchant/payments", label: "طرق الدفع" },
      { href: "/merchant/payments/wallet", label: "المحفظة" },
      { href: "/merchant/payments/tax", label: "إدارة الضرائب" },
    ],
  },
  {
    label: "الأدوات المساعدة", icon: Wrench, href: "/merchant/tools",
    items: [
      { href: "/merchant/tools/apps", label: "متجر التطبيقات" },
      { href: "/merchant/tools/developer", label: "أدوات المطور" },
    ],
  },
  {
    label: "السجلات", icon: FileClock, href: "/merchant/logs",
    items: [
      { href: "/merchant/logs/operations", label: "سجل العمليات" },
      { href: "/merchant/logs/inventory", label: "سجل المخزون" },
      { href: "/merchant/logs/deleted", label: "سجل المحذوفات" },
    ],
  },
  { label: "الإعدادات", icon: Settings, href: "/merchant/settings", items: [
    { href: "/merchant/settings/plan", label: "الباقة والاشتراك" },
    { href: "/merchant/settings/contact", label: "قنوات التواصل" },
    { href: "/merchant/settings/notifications", label: "الإشعارات" },
  ] },
];

export default function MerchantSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <aside className="w-72 shrink-0 border-e border-white/8 bg-ink-900/40 hidden lg:flex flex-col sticky top-0 h-screen">
      <div className="p-5 border-b border-white/8 flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-500/30 to-viol-500/30 border border-white/10">
          <Store className="w-5 h-5 text-neon-400" />
        </span>
        <div>
          <p className="font-bold text-sm leading-tight">مسبار</p>
          <p className="text-[11px] text-ink-300">لوحة التاجر</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {MERCHANT_NAV.map((group) => {
          const isActive = group.href && (group.href === "/merchant" ? pathname === "/merchant" : pathname.startsWith(group.href));
          const hasItems = group.items.length > 0;
          const open = openGroups[group.label] ?? isActive;

          // Group header
          return (
            <div key={group.label} className="mb-0.5">
              {hasItems ? (
                <button
                  onClick={() => setOpenGroups((s) => ({ ...s, [group.label]: !open }))}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-200 hover:bg-white/5 hover:text-ink-100 transition-colors"
                >
                  <group.icon className="w-4.5 h-4.5 text-ink-300 shrink-0" />
                  <span className="flex-1 text-right">{group.label}</span>
                  <ChevronDown className={`w-4 h-4 text-ink-300 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <Link
                  href={group.href!}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive ? "bg-neon-400/10 text-neon-400" : "text-ink-200 hover:bg-white/5 hover:text-ink-100"
                  }`}
                >
                  <group.icon className="w-4.5 h-4.5 text-ink-300 shrink-0" />
                  <span>{group.label}</span>
                </Link>
              )}

              {hasItems && open && (
                <div className="mt-0.5 mb-1 space-y-0.5 ps-4 border-s border-white/8 ms-5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                          active ? "text-neon-400 bg-neon-400/5" : "text-ink-300 hover:text-ink-100 hover:bg-white/5"
                        }`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/8">
        <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:text-neon-400 transition-colors">
          <ArrowRight className="w-4 h-4" />
          عرض المتجر
        </Link>
      </div>
    </aside>
  );
}
