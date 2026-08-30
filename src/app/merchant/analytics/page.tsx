import { requireRole } from "@/lib/guard";
import { Construction } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MerchantAnalyticsPage() {
  await requireRole(["merchant", "admin"], "/login");
  return (
    <div className="rounded-3xl glass p-12 text-center max-w-lg mx-auto mt-10">
      <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-500/20 to-viol-500/20 border border-white/10 mb-5">
        <Construction className="w-8 h-8 text-neon-400" />
      </span>
      <h2 className="text-xl font-bold mb-2">قسم analytics — قيد الإنجاز</h2>
      <p className="text-sm text-ink-300 leading-7">نعمل على هذه النافذة بالترتيب وفق خطة المنصة. تابع تحديثاتنا — سيتم ربطها بقاعدة البيانات الحقيقية.</p>
    </div>
  );
}
