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
      { href: "/merchant/orders/assign", label: "إسناد الطلبات" },
      { href: "/merchant/orders/bulk-status", label: "تحديث حالة مجموعة" },
      { href: "/merchant/orders/statuses", label: "تخصيص حالات الطلب" },
      { href: "/merchant/orders/auto-tags", label: "الوسوم التلقائية" },
      { href: "/merchant/orders/settings", label: "إعدادات الطلبات" },
      { href: "/merchant/orders/complaints", label: "شكاوى العملاء" },
      { href: "/merchant/orders/rating", label: "تقييم الطلبات" },
      { href: "/merchant/orders/invoice-editor", label: "محرر الفواتير" },
      { href: "/merchant/orders/cart-options", label: "خيارات السلة" },
      { href: "/merchant/orders/apple-wallet", label: "تتبع Apple Wallet" },
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
      { href: "/merchant/inventory/reorder-point", label: "حد إعادة الطلب" },
      { href: "/merchant/inventory/count", label: "جرد المخزون" },
      { href: "/merchant/inventory/warehouses", label: "المستودعات المتعددة" },
      { href: "/merchant/inventory/alerts", label: "تنبيهات النفاد" },
      { href: "/merchant/inventory/notify", label: "أعلمني عند التوفر" },
      { href: "/merchant/inventory/export", label: "تصدير المخزون" },
      { href: "/merchant/inventory/adjustment", label: "تسوية المخزون" },
      { href: "/merchant/inventory/coverage", label: "نطاق تغطية الفروع" },
      { href: "/merchant/inventory/import", label: "استيراد المخزون" },
      { href: "/merchant/products/variants", label: "خيارات المنتج" },
      { href: "/merchant/products/categories", label: "التصنيفات والخيارات" },
      { href: "/merchant/products/brands", label: "الماركات والعلامات" },
      { href: "/merchant/products/tags", label: "وسوم المنتجات" },
      { href: "/merchant/products/custom-fields", label: "الحقول المخصصة" },
      { href: "/merchant/products/restrictions", label: "قيود المنتج" },
      { href: "/merchant/products/reorder", label: "ترتيب المنتجات" },
      { href: "/merchant/products/digital-cards", label: "سجل البطاقات الرقمية" },
      { href: "/merchant/products/import", label: "الاستيراد والتصدير" },
      { href: "/merchant/products/stores", label: "الفروع والمستودعات" },
      { href: "/merchant/products/digital", label: "إضافة منتج رقمي" },
      { href: "/merchant/products/pre-order", label: "الطلب المسبق" },
      { href: "/merchant/products/size-chart", label: "جدول المقاسات" },
      { href: "/merchant/products/spreadsheet", label: "محرر جدولي" },
      { href: "/merchant/products/deleted", label: "حذف واستعادة" },
      { href: "/merchant/products/data-quality", label: "جودة البيانات" },
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
      { href: "/merchant/marketing/cashback", label: "الكاش باك" },
      { href: "/merchant/marketing/coupon-groups", label: "مجموعات الكوبونات" },
      { href: "/merchant/marketing/repurchase", label: "إعادة الشراء" },
      { href: "/merchant/marketing/affiliate", label: "التسويق بالعمولة" },
      { href: "/merchant/marketing/gifting", label: "نظام الإهداء" },
      { href: "/merchant/marketing/settings", label: "إعدادات التسويق" },
      { href: "/merchant/marketing/coupon-custom", label: "إنشاء كوبون مخصص" },
      { href: "/merchant/marketing/coupon-conditions", label: "شروط الكوبون" },
      { href: "/merchant/marketing/promotions", label: "العروض الترويجية" },
      { href: "/merchant/marketing/special-offer", label: "عرض ترويجي خاص" },
      { href: "/merchant/marketing/cart-offers", label: "عروض السلة" },
      { href: "/merchant/marketing/market-priority", label: "أولوية العروض" },
      { href: "/merchant/marketing/bank-discounts", label: "خصومات البنك" },
      { href: "/merchant/marketing/cart-recovery", label: "استرجاع السلة" },
      { href: "/merchant/marketing/abandoned-export", label: "تصدير السلات المتروكة" },
      { href: "/merchant/marketing/abandoned-visibility", label: "إخفاء/إظهار السلات" },
      { href: "/merchant/marketing/cart-ads", label: "إعلانات سلة" },
      { href: "/merchant/marketing/cart-ads-payment", label: "طرق دفع إعلانات سلة" },
      { href: "/merchant/marketing/ads-platforms", label: "حملات المنصات" },
      { href: "/merchant/marketing/sms", label: "حملات SMS" },
      { href: "/merchant/marketing/push", label: "إشعارات التطبيق" },
      { href: "/merchant/marketing/influencers", label: "التسويق بالمؤثرين" },
      { href: "/merchant/marketing/blog", label: "المدونة" },
      { href: "/merchant/marketing/direct-order", label: "الطلب المباشر" },
      { href: "/merchant/marketing/schedule", label: "الجدول الزمني" },
    ],
  },
  {
    label: "المتجر الإلكتروني", icon: Store, href: "/merchant/store",
    items: [
      { href: "/merchant/store/design", label: "تصميم المتجر" },
      { href: "/merchant/store/themes", label: "متجر الثيمات" },
      { href: "/merchant/store/themes/shop", label: "البحث عن ثيم" },
      { href: "/merchant/store/themes/copies", label: "نسخ الثيم" },
      { href: "/merchant/store/themes/elements", label: "عناصر الثيم" },
      { href: "/merchant/store/themes/promo-bar", label: "الشريط الترويجي" },
      { href: "/merchant/store/themes/dev-requests", label: "طلبات تطوير الثيم" },
      { href: "/merchant/store/themes/services", label: "خدمات تخصيص الثيم" },
      { href: "/merchant/store/domain", label: "دومين المتجر" },
      { href: "/merchant/store/pages", label: "الصفحات التعريفية" },
      { href: "/merchant/store/landing", label: "صفحات الهبوط" },
    ],
  },
  {
    label: "العملاء", icon: Users, href: "/merchant/customers",
    items: [
      { href: "/merchant/customers", label: "إدارة العملاء" },
      { href: "/merchant/customers/customer", label: "بطاقة العميل" },
      { href: "/merchant/customers/new", label: "إنشاء عميل" },
      { href: "/merchant/customers/groups", label: "إدارة المجموعات" },
      { href: "/merchant/customers/import", label: "استيراد العملاء" },
      { href: "/merchant/customers/export", label: "تصدير العملاء" },
      { href: "/merchant/customers/settings", label: "إعدادات العملاء" },
      { href: "/merchant/customers/bulk", label: "الإجراءات الجماعية" },
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
      { href: "/merchant/analytics/reports/summary", label: "ملخص الأداء" },
      { href: "/merchant/analytics/reports/sales", label: "تقارير المبيعات" },
      { href: "/merchant/analytics/reports/products", label: "تقارير المنتجات" },
      { href: "/merchant/analytics/reports/inventory", label: "تقارير المخزون" },
      { href: "/merchant/analytics/reports/customers", label: "تقارير العملاء" },
      { href: "/merchant/analytics/reports/geo", label: "التوزيع الجغرافي" },
      { href: "/merchant/analytics/reports/payments", label: "تقارير الدفع" },
      { href: "/merchant/analytics/reports/shipping", label: "تقارير الشحن" },
      { href: "/merchant/analytics/reports/conversion", label: "معدل التحويل" },
      { href: "/merchant/analytics/reports/preferences", label: "تفضيلات الشراء" },
      { href: "/merchant/analytics/reports/behavior", label: "سلوك العملاء" },
      { href: "/merchant/analytics/reports/abandoned", label: "السلات المتروكة" },
      { href: "/merchant/analytics/reports/marketing", label: "تقارير التسويق" },
      { href: "/merchant/analytics/reports/loyalty", label: "تقارير الولاء" },
      { href: "/merchant/analytics/reports/cart-points", label: "سلة بوينت" },
      { href: "/merchant/analytics/reports/customer-wallet", label: "محفظة العميل" },
      { href: "/merchant/analytics/reports", label: "التقارير التفصيلية" },
    ],
  },
  {
    label: "الشحن", icon: Truck, href: "/merchant/shipping",
    items: [
      { href: "/merchant/shipping", label: "شركات الشحن" },
      { href: "/merchant/shipping/settings", label: "إعدادات الشحن" },
      { href: "/merchant/shipping/private", label: "شركة شحن خاصة" },
      { href: "/merchant/shipping/dispatchers", label: "المناديب" },
      { href: "/merchant/shipping/labels/create", label: "بوليصات الشحن" },
      { href: "/merchant/shipping/routes", label: "مسارات الشحن" },
      { href: "/merchant/shipping/quality-gate", label: "بوابة الجودة" },
      { href: "/merchant/shipping/reset-pricing", label: "استعادة التسعير الافتراضي" },
      { href: "/merchant/shipping/pricing", label: "تسعير البوليصات" },
      { href: "/merchant/shipping/packaging", label: "مواد التغليف" },
      { href: "/merchant/shipping/track", label: "تتبع البوليصات" },
      { href: "/merchant/shipping/labels", label: "أرشيف البوليصات" },
      { href: "/merchant/shipping/free", label: "الشحن المجاني" },
      { href: "/merchant/shipping/cod", label: "الدفع عند الاستلام" },
      { href: "/merchant/shipping/express", label: "الشحن السريع" },
      { href: "/merchant/shipping/international", label: "الشحن الدولي" },
      { href: "/merchant/shipping/hs-code", label: "أكواد HS" },
      { href: "/merchant/shipping/international-calculator", label: "حاسبة الشحن الدولي" },
      { href: "/merchant/shipping/readiness", label: "جاهزية الشحن الدولي" },
      { href: "/merchant/shipping/excluded-cities", label: "استثناء المدن" },
      { href: "/merchant/shipping/restrictions", label: "قيود شركات الشحن" },
    ],
  },
  {
    label: "الدفع", icon: CreditCard, href: "/merchant/payments",
    items: [
      { href: "/merchant/payments", label: "طرق الدفع" },
      { href: "/merchant/payments/e-payments", label: "المدفوعات الإلكترونية" },
      { href: "/merchant/payments/wallets", label: "المحافظ الرقمية" },
      { href: "/merchant/payments/apple-pay", label: "Apple Pay" },
      { href: "/merchant/payments/google-pay", label: "Google Pay" },
      { href: "/merchant/payments/stc-pay", label: "STC Pay" },
      { href: "/merchant/payments/paypal", label: "PayPal" },
      { href: "/merchant/payments/installments", label: "الدفع الآجل" },
      { href: "/merchant/payments/bank-accounts", label: "الحسابات البنكية" },
      { href: "/merchant/payments/transfer-cycle", label: "دورة تحويل المدفوعات" },
      { href: "/merchant/payments/wallet", label: "محفظة المتجر" },
      { href: "/merchant/payments/e-invoices", label: "الفواتير الإلكترونية" },
      { href: "/merchant/payments/tax", label: "ضريبة القيمة المضافة" },
      { href: "/merchant/payments/limits", label: "حدود معاملات الدفع" },
      { href: "/merchant/payments/fraud", label: "مكافحة الاحتيال" },
    ],
  },
  {
    label: "الأدوات المساعدة", icon: Wrench, href: "/merchant/tools",
    items: [
      { href: "/merchant/tools/apps", label: "متجر التطبيقات" },
      { href: "/merchant/tools/apps/shop", label: "البحث عن تطبيق" },
      { href: "/merchant/tools/apps/manage", label: "التطبيقات المثبتة" },
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
    { href: "/merchant/settings/hub", label: "مركز الإعدادات الموحد" },
    { href: "/merchant/settings", label: "بيانات المتجر" },
    { href: "/merchant/settings/plan", label: "الباقة والاشتراك" },
    { href: "/merchant/settings/contact", label: "قنوات التواصل" },
    { href: "/merchant/settings/notifications", label: "الإشعارات" },
    { href: "/merchant/settings/languages", label: "لغات المتجر" },
    { href: "/merchant/settings/currencies", label: "العملات" },
    { href: "/merchant/settings/maintenance", label: "وضع الصيانة" },
    { href: "/merchant/settings/bank", label: "الحساب البنكي" },
    { href: "/merchant/settings/customs-fees", label: "الرسوم الجمركية" },
    { href: "/merchant/settings/subdomain", label: "الدومين الفرعي" },
    { href: "/merchant/settings/domain-email", label: "بريد الدومين" },
    { href: "/merchant/settings/custom-links", label: "الروابط المخصصة" },
    { href: "/merchant/settings/translation", label: "الترجمة" },
  ] },
];

export default function MerchantSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <aside className="w-72 shrink-0 border-e border-white/8 bg-ink-900/40 flex flex-col sticky top-0 h-screen">
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
          const open = openGroups[group.label] ?? true; // show all groups expanded by default

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
