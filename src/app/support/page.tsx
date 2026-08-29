"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Headset, Send, Loader2, Clock3, MessageSquareText, BadgeHelp } from "lucide-react";
import Faq from "@/components/home/faq";

const TOPICS = ["استفسار قبل الشراء", "مساعدة في التفعيل", "مشكلة في مفتاح", "استبدال أو استرجاع", "اقتراح أو شراكة"];

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "support", name: name.trim(), email: email.trim(), subject, message: message.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "تعذر الإرسال");
      toast.success("وصلتنا رسالتك", { description: "سنرد عليك خلال ساعات العمل — عادة في أقل من ساعة" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر الإرسال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-14">
        <span className="mx-auto mb-6 grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30 text-neon-400">
          <Headset className="w-8 h-8" strokeWidth={1.6} />
        </span>
        <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">SUPPORT</p>
        <h1 className="text-4xl sm:text-5xl font-bold">كيف نقدر نساعدك؟</h1>
        <p className="text-ink-300 mt-4 max-w-xl mx-auto leading-8">فريق دعم عربي يرافقك من اختيار الترخيص حتى اكتمال التفعيل — مجانًا مع كل طلب.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
        {/* quick info */}
        <div className="space-y-4">
          {[
            { icon: Clock3, t: "أوقات الاستجابة", d: "يوميًا من 9 صباحًا حتى 12 منتصف الليل — متوسط الرد أقل من 60 دقيقة." },
            { icon: MessageSquareText, t: "مساعدة التفعيل", d: "أرسل رقم طلبك مع وصف المشكلة، وسيتولى مختص تفعيل منتجك معك خطوة بخطوة." },
            { icon: BadgeHelp, t: "قبل أن تراسلنا", d: "أغلب الإجابات موجودة في الأسئلة الشائعة — جرّبها أولًا لتوفير وقتك." },
          ].map((c) => (
            <div key={c.t} className="glass rounded-3xl p-6 hover-lift">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-neon-400/10 border border-neon-400/30 text-neon-400 mb-4">
                <c.icon className="w-5 h-5" strokeWidth={1.7} />
              </span>
              <h3 className="font-bold mb-2">{c.t}</h3>
              <p className="text-sm text-ink-300 leading-7">{c.d}</p>
            </div>
          ))}
        </div>

        {/* form */}
        <form onSubmit={submit} className="glass-strong rounded-3xl p-8 space-y-5">
          <h2 className="font-bold text-xl">راسل الدعم</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink-300 mb-2">الاسم *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="اسمك الكريم" required />
            </div>
            <div>
              <label className="block text-xs text-ink-300 mb-2">البريد الإلكتروني *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" className="field text-left" placeholder="you@email.com" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-300 mb-2">نوع الطلب</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="field bg-ink-850 cursor-pointer">
              {TOPICS.map((t) => (
                <option key={t} className="bg-ink-850">{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-300 mb-2">رسالتك *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="field resize-none" placeholder="اكتب تفاصيل طلبك، وإن كان متعلقًا بطلب سابق فاذكر رقم الطلب…" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
            {loading ? "جارٍ الإرسال…" : "إرسال الرسالة"}
          </button>
        </form>
      </div>

      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">الأسئلة الشائعة</h2>
        <Faq id="faq" />
      </div>
    </div>
  );
}
