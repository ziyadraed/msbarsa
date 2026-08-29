"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Radar, Send, MapPin, Mail, Clock3, ShieldCheck } from "lucide-react";

const LINKS = [
  {
    title: "المتجر",
    items: [
      { label: "جميع المنتجات", href: "/shop" },
      { label: "عروض اليوم", href: "/shop?deals=1" },
      { label: "أنظمة ويندوز", href: "/shop?c=windows" },
      { label: "أوفيس و Microsoft 365", href: "/shop?c=office" },
      { label: "برامج الحماية", href: "/shop?c=security" },
    ],
  },
  {
    title: "حسابك",
    items: [
      { label: "تسجيل الدخول", href: "/login" },
      { label: "إنشاء حساب", href: "/register" },
      { label: "تتبع الطلب", href: "/track" },
      { label: "حسابي وطلباتي", href: "/account" },
    ],
  },
  {
    title: "معلومات",
    items: [
      { label: "من نحن", href: "/about" },
      { label: "الدعم والمساعدة", href: "/support" },
      { label: "الأسئلة الشائعة", href: "/support#faq" },
    ],
  },
];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const subscribe = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "newsletter", email }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "تعذر الاشتراك");
      toast.success("تم الاشتراك بنجاح", { description: "سيصلك جديد العروض على بريدك" });
      setEmail("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الاشتراك");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="relative mt-24 border-t border-white/8 bg-ink-900/60">
      <div className="absolute top-0 inset-x-0 h-px shimmer-line" />
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500 to-viol-500 text-ink-950">
                <Radar className="w-6 h-6" />
              </span>
              <div>
                <p className="text-xl font-bold">مسبار</p>
                <p className="font-latin text-[10px] tracking-[0.35em] text-ink-300">MESBAR.STORE</p>
              </div>
            </div>
            <p className="text-sm text-ink-300 leading-7 max-w-sm">
              متجر سعودي متخصص في التراخيص الرقمية الأصلية لأشهر برامج العالم — تسليم فوري، أسعار منافسة، ودعم يرافقك حتى اكتمال التفعيل.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-ink-300">
              <p className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-neon-400" /> الرياض، المملكة العربية السعودية</p>
              <p className="flex items-center gap-2.5" dir="ltr"><Mail className="w-4 h-4 text-neon-400" /> support@mesbar.store</p>
              <p className="flex items-center gap-2.5"><Clock3 className="w-4 h-4 text-neon-400" /> الدعم متاح يوميًا 9ص — 12م</p>
            </div>

            <div className="mt-8">
              <p className="font-semibold mb-3">اشترك ليصلك جديد العروض</p>
              <div className="flex gap-2 max-w-sm">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && subscribe()}
                  type="email"
                  dir="ltr"
                  placeholder="email@example.com"
                  className="field !rounded-2xl text-left flex-1"
                />
                <button onClick={subscribe} disabled={sending} className="btn-primary rounded-2xl px-4 grid place-items-center disabled:opacity-60" aria-label="اشتراك">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {LINKS.map((col) => (
              <div key={col.title}>
                <p className="font-bold mb-4 text-white">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.items.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-sm text-ink-300 hover:text-neon-400 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-300">
            <p>© {new Date().getFullYear()} متجر مسبار — جميع الحقوق محفوظة.</p>
            <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> مشترياتك محمية بضمان الاستبدال الفوري</p>
          </div>
          <p className="text-[11px] leading-6 text-ink-300/70">
            إفصاح العلامات التجارية: Microsoft و Windows و Office و Microsoft 365 علامات تجارية لشركة Microsoft Corporation.
            Adobe و Creative Cloud و Photoshop و Illustrator علامات تجارية لشركة Adobe Inc. كما أن Kaspersky و McAfee و ESET و Autodesk
            و AutoCAD و Revit علامات تجارية مسجلة لأصحابها المعنيين. متجر مسبار متجر مستقل لإعادة بيع التراخيص الرقمية الأصلية،
            وجميع أسماء المنتجات تُستخدم لأغراض التعريف فقط دون أي ادعاء بشراكة أو رعاية من الشركات المنتجة.
          </p>
        </div>
      </div>
    </footer>
  );
}
