"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const FAQS = [
  {
    q: "هل التراخيص أصلية ومدعومة؟",
    a: "جميع التراخيص المعروضة رخص رقمية أصلية قابلة للتفعيل الرسمي عبر الإنترنت، وتصلك مع دليل تفعيل واضح. أي مفتاح لا يعمل يتم استبداله فورًا دون أي تكلفة إضافية.",
  },
  {
    q: "كيف أستلم المنتج بعد الشراء؟",
    a: "فور إتمام الطلب تظهر مفاتيح التفعيل مباشرة في صفحة تأكيد الطلب، ويمكنك استرجاعها في أي وقت عبر صفحة «تتبع الطلب» بإدخال رقم الطلب وبريدك الإلكتروني، أو من حسابك إذا كنت مسجلًا.",
  },
  {
    q: "كم يستغرق التسليم؟",
    a: "التسليم فوري وآلي. في الحالات الطبيعية تظهر الأكواد خلال ثوانٍ من تأكيد الدفع، ومتوسط التسليم الفعلي لدينا أقل من 5 دقائق.",
  },
  {
    q: "ما هي طرق الدفع المتاحة؟",
    a: "ندعم البطاقات البنكية (فيزا وماستركارد) ومدى وApple Pay. جميع المدفوعات تتم عبر قناة آمنة ومشفرة، ولا يتم تخزين بيانات بطاقتك لدينا.",
  },
  {
    q: "هل تقدمون دعمًا للتثبيت والتفعيل؟",
    a: "نعم — كل طلب يتضمن دليل تفعيل مصورًا بالعربية، وفريق الدعم يرافقك عبر صفحة التواصل حتى اكتمال التفعيل بنجاح دون رسوم إضافية.",
  },
  {
    q: "ما سياسة الاستبدال والاسترجاع؟",
    a: "إذا تعذر تفعيل المفتاح لأي سبب، نوفر بديلًا فوريًا أو استردادًا كاملًا للمبلغ خلال 30 يومًا من الشراء. راحة بالك أولويتنا.",
  },
];

export default function Faq({ id }: { id?: string }) {
  const [open, setOpen] = useState<string | null>(FAQS[0].q);
  return (
    <div id={id} className="space-y-3 scroll-mt-28">
      {FAQS.map((f) => {
        const isOpen = open === f.q;
        return (
          <div key={f.q} className={cn("glass rounded-2xl overflow-hidden transition-colors duration-300", isOpen && "border-neon-400/40")}>
            <button onClick={() => setOpen(isOpen ? null : f.q)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start">
              <span className="font-semibold">{f.q}</span>
              <span className={cn("grid place-items-center w-8 h-8 rounded-full border border-white/12 transition-transform duration-400", isOpen && "rotate-45 bg-neon-400/15 border-neon-400/50 text-neon-400")}>
                <Plus className="w-4 h-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="px-6 pb-6 text-sm leading-7 text-ink-300">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
