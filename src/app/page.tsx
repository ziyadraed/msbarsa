import Link from "next/link";
import { ArrowLeft, AppWindow, FileText, Server, PenTool, ShieldCheck, DraftingCompass, MousePointerClick, CreditCard, KeyRound, BadgeCheck, Headset, RefreshCcw, Lock, Quote } from "lucide-react";
import Hero from "@/components/home/hero";
import DealBanner from "@/components/home/deal-banner";
import ProductCarousel from "@/components/home/product-carousel";
import Faq from "@/components/home/faq";
import Reveal from "@/components/store/reveal";
import ProductCard from "@/components/store/product-card";
import { getCategories, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

const CAT_ICONS: Record<string, typeof AppWindow> = {
  "layout-grid": AppWindow,
  "file-text": FileText,
  server: Server,
  "pen-tool": PenTool,
  "shield-check": ShieldCheck,
  "drafting-compass": DraftingCompass,
};

const CAT_TINTS: Record<string, string> = {
  cyan: "from-sky-500/20 to-cyan-400/10 text-sky-300 border-sky-400/25",
  amber: "from-amber-500/20 to-orange-400/10 text-amber-300 border-amber-400/25",
  teal: "from-teal-500/20 to-emerald-400/10 text-teal-300 border-teal-400/25",
  magenta: "from-fuchsia-500/20 to-pink-400/10 text-fuchsia-300 border-fuchsia-400/25",
  emerald: "from-emerald-500/20 to-green-400/10 text-emerald-300 border-emerald-400/25",
  violet: "from-violet-500/20 to-purple-400/10 text-violet-300 border-violet-400/25",
};

const STEPS = [
  { icon: MousePointerClick, title: "اختر ترخيصك", desc: "تصفح الأقسام وحدد النسخة المناسبة لجهازك بضغطة واحدة." },
  { icon: CreditCard, title: "ادفع بأمان", desc: "بوابة دفع مشفرة تدعم البطاقات ومدى وApple Pay." },
  { icon: KeyRound, title: "استلم الكود فورًا", desc: "مفتاح التفعيل يظهر مباشرة بعد الطلب مع دليل عربي مبسّط." },
];

const PILLARS = [
  { icon: BadgeCheck, title: "أصالة مضمونة", desc: "مفاتيح تفعيل رسمية تعمل عبر الإنترنت دون أدوات خارجية." },
  { icon: RefreshCcw, title: "ضمان الاستبدال", desc: "أي مفتاح لا يُفعّل يُستبدل فورًا أو يُسترد كامل مبلغه خلال 30 يومًا." },
  { icon: Headset, title: "دعم عربي يرافقك", desc: "مساعدة مجانية في التثبيت والتفعيل حتى يعمل البرنامج لديك." },
  { icon: Lock, title: "خصوصية وأمان", desc: "بياناتك مُشفرة ولا نحتفظ بأي معلومات دفع على خوادمنا." },
];

const TESTIMONIALS = [
  { name: "عبدالله م.", role: "مصمم جرافيك", text: "طلبت ترخيص حزمة التصميم، ووصلني الكود قبل حتى ما أجهز الجهاز. التفعيل تم خلال دقيقتين بالضبط." },
  { name: "نورة س.", role: "طالبة هندسة", text: "أول مرة أشتري ترخيص أصلي بسعر أقدر أتحمله. شرحهم للتفعيل كان واضحًا وخدمة العملاء ردّت بسرعة." },
  { name: "فهد ع.", role: "مدير تقنية معلومات", text: "جهزنا أجهزة الشركة كاملة من هنا. فواتير مرتبة وتسليم فوري، وهذا اللي نحتاجه فعليًا." },
  { name: "سارة ح.", role: "صانعة محتوى", text: "كنت مترددة بسبب تجارب سيئة سابقة، لكن هنا كل شيء نظامي — الدفع آمن والمفتاح اشتغل من أول محاولة." },
];

export default async function HomePage() {
  const [cats, featured, deals] = await Promise.all([
    getCategories(),
    getProducts({}),
    getProducts({ deals: true }),
  ]);
  const dealProduct = deals[0] ?? featured[0];
  const top = featured.slice(0, 8);

  return (
    <>
      <Hero />

      {/* categories */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">CATEGORIES</p>
              <h2 className="text-3xl sm:text-4xl font-bold">تسوّق حسب الفئة</h2>
            </div>
            <Link href="/shop" className="btn-ghost rounded-2xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
              جميع المنتجات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c, i) => {
            const Icon = CAT_ICONS[c.icon] ?? AppWindow;
            const tint = CAT_TINTS[c.tint] ?? CAT_TINTS.cyan;
            return (
              <Reveal key={c.slug} delay={i * 0.06}>
                <Link
                  href={`/shop?c=${c.slug}`}
                  className="group glass hover-lift rounded-3xl p-6 flex items-center gap-5 h-full"
                >
                  <span className={`grid place-items-center w-14 h-14 rounded-2xl border bg-gradient-to-br shrink-0 ${tint} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7" strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="block font-bold text-lg group-hover:text-neon-400 transition-colors">{c.name}</span>
                    <span className="block text-xs text-ink-300 mt-1.5 leading-relaxed">{c.tagline}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* featured products */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">BESTSELLERS</p>
              <h2 className="text-3xl sm:text-4xl font-bold">الأكثر طلبًا</h2>
            </div>
            <Link href="/shop" className="btn-ghost rounded-2xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {top.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Salla-style best offers carousel */}
      <ProductCarousel
        title="عروض الأسبوع"
        subtitle="تسوّق أبرز العروض بأسعار مميزة — وتنقّل بينها بسهولة"
        products={featured.slice(8, 19)}
        displayAllUrl="/shop?deals=1"
      />

      {/* deal of the week */}
      <Reveal>
        <DealBanner product={dealProduct} />
      </Reveal>

      {/* how it works */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4">
          <Reveal className="text-center mb-14">
            <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-bold">من الطلب إلى التفعيل… في ٣ خطوات</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12}>
                <div className="relative glass rounded-3xl p-8 text-center hover-lift h-full">
                  <span className="absolute top-5 end-6 font-latin text-5xl font-bold text-outline">{`0${i + 1}`}</span>
                  <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30 text-neon-400 mb-6">
                    <s.icon className="w-8 h-8" strokeWidth={1.6} />
                  </span>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-sm text-ink-300 leading-7">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* trust pillars */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="glass rounded-3xl p-6 h-full hover-lift">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 mb-5">
                  <p.icon className="w-6 h-6" strokeWidth={1.7} />
                </span>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-[13px] text-ink-300 leading-6">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="text-center mb-12">
          <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">REVIEWS</p>
          <h2 className="text-3xl sm:text-4xl font-bold">عمّالنا يتحدثون</h2>
          <p className="text-ink-300 mt-3">متوسط تقييم 4.9 من 5 عبر أكثر من 8,900 مراجعة</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="glass rounded-3xl p-6 h-full flex flex-col hover-lift">
                <Quote className="w-6 h-6 text-neon-400/60 mb-4" />
                <blockquote className="text-sm leading-7 text-ink-200 flex-1">{t.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-neon-500/30 to-viol-500/30 border border-white/10 font-bold text-sm">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-[11px] text-ink-300">{t.role}</span>
                  </span>
                  <span className="ms-auto text-gold text-xs font-latin">★★★★★</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-8">
        <Reveal className="text-center mb-10">
          <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold">أسئلة تدور في بالك</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Faq />
        </Reveal>
      </section>

      {/* final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-neon-400/25 bg-gradient-to-l from-ink-800 to-ink-900 px-8 py-16 text-center">
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="absolute -bottom-40 start-1/3 w-[500px] h-[300px] bg-neon-400/15 blur-[120px] rounded-full" />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">جهازك يستحق ترخيصًا <span className="text-gradient">أصليًا</span></h2>
              <p className="mt-5 text-ink-300 max-w-xl mx-auto leading-8">ابدأ الآن — تفعيل خلال دقيقة، ضمان استبدال، ودعم لا يتركك حتى يعمل كل شيء.</p>
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2.5 rounded-2xl px-10 py-4 font-bold mt-9">
                ابدأ التسوق
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
