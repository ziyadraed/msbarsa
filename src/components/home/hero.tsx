"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Zap, ShieldCheck, BadgeCheck, PackageCheck } from "lucide-react";

const CHIPS = [
  { label: "Windows 11 Pro", pos: "top-[8%] right-[6%]", delay: 0 },
  { label: "Office 2021", pos: "bottom-[16%] right-[2%]", delay: 1.2 },
  { label: "Adobe CC", pos: "top-[38%] left-[4%]", delay: 0.6 },
  { label: "Kaspersky", pos: "bottom-[6%] left-[16%]", delay: 1.8 },
];

const STATS = [
  { icon: PackageCheck, value: "+12,400", label: "طلب مكتمل" },
  { icon: Star, value: "4.9/5", label: "متوسط التقييم" },
  { icon: Zap, value: "< 5 دقائق", label: "متوسط التسليم" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* backdrop */}
      <div className="absolute inset-0">
        <Image src="/images/hero-core.jpg" alt="" fill priority className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/55 to-ink-950" />
        <div className="absolute inset-0 bg-grid" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs text-neon-400 mb-7"
            >
              <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse-soft" />
              متجر التراخيص الرقمية — تفعيل خلال 60 ثانية
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.12] tracking-tight"
            >
              فعّل برامجك
              <br />
              <span className="text-gradient">الأصلية.</span> بثوانٍ.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-lg text-ink-300 leading-9 max-w-xl"
            >
              تراخيص رقمية أصلية لأنظمة التشغيل وحزم الإنتاجية وأدوات التصميم والحماية — تصلك مفاتيح التفعيل على بريدك فور إتمام الطلب، مع ضمان استبدال ودعم بالعربية خطوة بخطوة.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link href="/shop" className="btn-primary rounded-2xl px-8 py-4 font-bold flex items-center gap-2.5">
                تصفح المتجر
                <ArrowLeft className="w-4.5 h-4.5" />
              </Link>
              <Link href="/shop?deals=1" className="btn-ghost rounded-2xl px-8 py-4 font-semibold text-ink-100">
                عروض اليوم
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.55 }}
              className="mt-12 flex flex-wrap gap-x-10 gap-y-5"
            >
              {STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="grid place-items-center w-11 h-11 rounded-2xl glass text-neon-400">
                    <s.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-latin font-bold text-lg leading-tight">{s.value}</p>
                    <p className="text-xs text-ink-300">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* orbital visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
            dir="ltr"
          >
            <div className="relative aspect-square max-w-[520px] mx-auto">
              <div className="absolute inset-[8%] rounded-full border border-neon-400/15 animate-spin-slow" style={{ animationDirection: "reverse" }} />
              <div className="absolute inset-[22%] rounded-full border border-viol-500/20 animate-spin-slow" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative w-[62%] aspect-square rounded-[2.5rem] overflow-hidden ring-glow">
                  <Image src="/images/hero-core.jpg" alt="مفتاح ترخيص رقمي" fill className="object-cover" />
                </div>
              </div>
              {CHIPS.map((c) => (
                <motion.div
                  key={c.label}
                  className={`absolute ${c.pos}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + c.delay * 0.2, duration: 0.7 }}
                >
                  <div className="glass-strong rounded-2xl px-4 py-2.5 flex items-center gap-2.5 animate-float font-latin text-sm font-medium" style={{ animationDelay: `${c.delay}s` }}>
                    <ShieldCheck className="w-4 h-4 text-neon-400" />
                    {c.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* brand marquee */}
      <div className="relative border-y border-white/6 bg-ink-900/40 py-5 overflow-hidden" dir="ltr">
        <div className="flex w-max animate-marquee gap-12">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-12 shrink-0" aria-hidden={dup === 1}>
              {["WINDOWS 11", "OFFICE 365", "ADOBE CC", "KASPERSKY", "MCAFEE", "ESET", "AUTOCAD", "SERVER 2022"].map((b) => (
                <span key={b} className="flex items-center gap-3 font-latin text-lg font-semibold tracking-[0.3em] text-outline whitespace-nowrap">
                  <BadgeCheck className="w-4 h-4 text-neon-400/50" />
                  {b}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
