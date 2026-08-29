import Link from "next/link";
import { ArrowLeft, Target, Eye, Gem, BadgeCheck, RefreshCcw, Headset } from "lucide-react";
import Reveal from "@/components/store/reveal";

export const metadata = {
  title: "من نحن",
  description: "تعرّف على متجر مسبار — رؤيتنا في إتاحة البرمجيات الأصلية بأسعار عادلة وتجربة شراء رقمية لا تشوبها شائبة.",
};

const VALUES = [
  { icon: BadgeCheck, t: "الأصالة أولًا", d: "لا مكان عندنا للمفاتيح المشبوهة؛ كل ترخيص يمر بفحص جودة قبل عرضه." },
  { icon: RefreshCcw, t: "العميل قبل الربح", d: "ضمان الاستبدال والاسترجاع سياسة ثابتة، لا استثناءات مجحفة." },
  { icon: Headset, t: "إنسان يرد عليك", d: "دعم عربي حقيقي من مختصين، لا ردود آلية جاهزة." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* intro */}
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
        <Reveal>
          <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-4">ABOUT MESBAR</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            نؤمن أن البرمجيات <span className="text-gradient">الأصلية</span> يجب أن تكون في متناول الجميع
          </h1>
          <p className="mt-6 text-ink-300 leading-9">
            بدأ «مسبار» من ملاحظة بسيطة: مستخدمون كثر يلجؤون للنسخ المقرصنة ليس حبًا فيها، بل لأن بدائل الشراء النظامية كانت معقدة وباهظة.
            بنينا متجرًا يعيد صياغة التجربة من الصفر — أسعار عادلة، دفع يستغرق ثواني، وتسليم فوري خلال دقائق، مع دعم يرافقك حتى
            يعمل برنامجك كما يجب.
          </p>
          <p className="mt-4 text-ink-300 leading-9">
            اليوم نخدم آلاف العملاء في المملكة والخليج: طلاب، مصممون، مهندسون، وشركات تجهّز أجهزتها بالجملة — وكلهم خرجوا بترخيص
            أصلي وضمان مكتوب.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 font-bold mt-8">
            تصفح منتجاتنا
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 bg-grid">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-500/15 via-transparent to-viol-500/15" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-latin text-[7rem] leading-none font-bold text-outline select-none" dir="ltr">MSBR</p>
                <p className="text-ink-300 mt-2 font-bold">مسبار للتراخيص الرقمية</p>
              </div>
            </div>
            <div className="absolute top-6 start-6 glass rounded-2xl px-5 py-3.5 animate-float">
              <p className="font-latin text-2xl font-bold text-neon-400">+12,400</p>
              <p className="text-[11px] text-ink-300">طلب مكتمل</p>
            </div>
            <div className="absolute bottom-6 end-6 glass rounded-2xl px-5 py-3.5 animate-float-slow">
              <p className="font-latin text-2xl font-bold text-lime-pop">4.9★</p>
              <p className="text-[11px] text-ink-300">رضا العملاء</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* mission & vision */}
      <div className="grid md:grid-cols-2 gap-5 mb-20">
        <Reveal>
          <div className="glass rounded-[2rem] p-10 h-full hover-lift">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-neon-400/12 border border-neon-400/30 text-neon-400 mb-6">
              <Target className="w-7 h-7" strokeWidth={1.6} />
            </span>
            <h2 className="text-2xl font-bold mb-4">رسالتنا</h2>
            <p className="text-ink-300 leading-8">
              أن نكون أسرع وأوثق قناة يحصل منها المستخدم العربي على تراخيصه الرقمية الأصلية: سعر منافس، تجربة شراء لا تحتاج شرحًا،
              وتسليم يُقاس بالدقائق لا بالأيام.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass rounded-[2rem] p-10 h-full hover-lift">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-viol-500/12 border border-viol-500/30 text-viol-500 mb-6">
              <Eye className="w-7 h-7" strokeWidth={1.6} />
            </span>
            <h2 className="text-2xl font-bold mb-4">رؤيتنا</h2>
            <p className="text-ink-300 leading-8">
              منطقة عربية لا تُستخدم فيها نسخة مقرصنة واحدة لأن البديل النظامي أصبح الأسهل والأرخص — نصل إلى ذلك ترخيصًا تلو الآخر.
            </p>
          </div>
        </Reveal>
      </div>

      {/* values */}
      <Reveal className="text-center mb-10">
        <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 text-gold mb-4">
          <Gem className="w-6 h-6" strokeWidth={1.6} />
        </span>
        <h2 className="text-3xl font-bold">قيم لا نساوم عليها</h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-5">
        {VALUES.map((v, i) => (
          <Reveal key={v.t} delay={i * 0.08}>
            <div className="glass rounded-3xl p-8 h-full hover-lift">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 mb-5">
                <v.icon className="w-6 h-6" strokeWidth={1.7} />
              </span>
              <h3 className="font-bold text-lg mb-3">{v.t}</h3>
              <p className="text-sm text-ink-300 leading-7">{v.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
