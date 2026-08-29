import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] grid place-items-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative text-center">
        <p className="font-latin text-[9rem] leading-none font-bold text-outline select-none" dir="ltr">404</p>
        <h1 className="text-3xl font-bold mt-2">هذه الصفحة خرجت عن المدار</h1>
        <p className="text-ink-300 mt-4 max-w-md mx-auto leading-8">
          الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله. عُد إلى المسار الصحيح وأكمل رحلتك.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-9">
          <Link href="/" className="btn-ghost rounded-2xl px-7 py-3.5 font-semibold flex items-center gap-2">
            <Compass className="w-4 h-4" />
            الرئيسية
          </Link>
          <Link href="/shop" className="btn-primary rounded-2xl px-7 py-3.5 font-bold flex items-center gap-2">
            تصفح المتجر
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
