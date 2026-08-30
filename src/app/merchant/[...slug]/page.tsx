import { requireRole } from "@/lib/guard";
import { Construction, Wrench } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  "orders/refunds": "المرتجعات والاسترداد",
  "orders/templates": "قوالب التصدير",
  "orders/new": "إنشاء طلب يدوي",
  "products/inventory": "إدارة المخزون",
  "products/transfers": "نقل المخزون",
  "products/categories": "التصنيفات والخيارات",
  "products/import": "الاستيراد والتصدير",
  "products/stores": "الفروع والمستودعات",
  "marketing/campaigns": "الحملات التسويقية",
  "marketing/abandoned": "السلات المتروكة",
  "marketing/seo": "تحسين محركات البحث",
  "marketing/loyalty": "نظام ولاء العملاء",
  "marketing/affiliate": "التسويق بالعمولة",
  "marketing/gifting": "نظام الإهداء",
  "store": "المتجر الإلكتروني",
  "store/design": "تصميم المتجر",
  "store/themes": "متجر الثيمات",
  "store/domain": "دومين المتجر",
  "store/pages": "الصفحات التعريفية",
  "store/landing": "صفحات الهبوط",
  "customers/groups": "إدارة المجموعات",
  "customers/import": "استيراد العملاء",
  "staff": "إدارة الموظفين",
  "staff/roles": "الأدوار الوظيفية",
  "analytics/reports": "التقارير التفصيلية",
  "shipping": "شركات الشحن",
  "shipping/settings": "إعدادات الشحن",
  "shipping/labels": "أرشيف البوليصات",
  "payments": "طرق الدفع",
  "payments/wallet": "المحفظة",
  "payments/tax": "إدارة الضرائب",
  "tools/apps": "متجر التطبيقات",
  "tools/developer": "أدوات المطور",
  "logs/operations": "سجل العمليات",
  "logs/inventory": "سجل المخزون",
  "logs/deleted": "سجل المحذوفات",
};

export default async function MerchantSectionPage({ params }: { params: Promise<{ slug: string[] }> }) {
  await requireRole(["merchant", "admin"], "/login");
  const { slug } = await params;
  const path = slug.join("/");
  const title = TITLES[path] ?? slug[slug.length - 1] ?? "القسم";

  return (
    <div className="rounded-3xl glass p-12 text-center max-w-lg mx-auto mt-10">
      <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-500/20 to-viol-500/20 border border-white/10 mb-5">
        <Construction className="w-8 h-8 text-neon-400" />
      </span>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-ink-300 leading-7">هذا القسم قيد التطوير — نعمل على إضافته وفق خطة بناء المنصة (نافذة بنافذة).</p>
      <Link href="/merchant" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold mt-6">
        <Wrench className="w-4 h-4" /> العودة للوحة التحكم
      </Link>
    </div>
  );
}
