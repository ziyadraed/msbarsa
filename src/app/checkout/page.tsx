"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, Lock, ShieldCheck, ArrowLeft, Loader2, BadgeCheck, CircleAlert, BadgeDollarSign, TicketPercent, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/store/cart-provider";
import { formatSAR, luhnValid, validEmail, cn } from "@/lib/utils";

type PayMethod = "card" | "mada" | "applepay";

type MoyasarFormConfig = {
  element: string;
  amount: number;
  currency: string;
  description: string;
  publishable_api_key: string;
  callback_url: string;
  methods?: string[];
  supported_networks?: string[];
  metadata?: Record<string, string>;
  on_completed?: (payment: { id: string }) => Promise<void> | void;
};

declare global {
  interface Window {
    Moyasar?: { init: (config: MoyasarFormConfig) => void };
  }
}

const MOYASAR_JS = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.js";
const MOYASAR_CSS = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.css";

function loadMoyasarAssets(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Moyasar) return resolve();
    if (!document.querySelector(`link[href="${MOYASAR_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = MOYASAR_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${MOYASAR_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = MOYASAR_JS;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("تعذر تحميل بوابة الدفع"));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  // contact
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // gateway state
  const [gateway, setGateway] = useState<{ enabled: boolean; publishableKey: string | null; currency: string } | null>(null);
  const [session, setSession] = useState<{ orderNumber: string; amount: number; description: string } | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  const [formMounted, setFormMounted] = useState(false);
  const moyasarContainerRef = useRef<HTMLDivElement>(null);

  // sandbox (fallback) state
  const [method, setMethod] = useState<PayMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");
  const [loading, setLoading] = useState(false);

  // coupon state
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; type: string; value: number; discount: number; total: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then(setGateway)
      .catch(() => setGateway({ enabled: false, publishableKey: null, currency: "SAR" }));
  }, []);

  const cardPreview = useMemo(() => {
    const d = cardNumber.replace(/\D/g, "").slice(0, 16);
    return (d.match(/.{1,4}/g) ?? []).join(" ");
  }, [cardNumber]);

  const contactValid = () => {
    if (cart.items.length === 0) return "سلتك فارغة";
    if (name.trim().length < 2) return "أدخل الاسم الكامل";
    if (!validEmail(email)) return "أدخل بريدًا إلكترونيًا صحيحًا — تُرسل الأكواد إليه";
    return null;
  };

  const cartItemsPayload = () => cart.items.map((i) => ({ slug: i.slug, qty: i.qty }));

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return setError("أدخل كود الخصم");
    setError(null);
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, items: cartItemsPayload() }),
      });
      const d = await res.json();
      if (!res.ok) {
        setCoupon(null);
        return setError(d.error || "كود الخصم غير صالح");
      }
      setCoupon(d);
      toast.success(`تم تطبيق الخصم: -${formatSAR(d.discount)}`);
    } catch {
      setError("تعذر التحقق من الكوبون");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
  };

  /* ---------------- real gateway flow ---------------- */
  const startMoyasar = async () => {
    const v = contactValid();
    if (v) return setError(v);
    if (!gateway?.enabled || !gateway.publishableKey) return;
    setError(null);
    setStartingSession(true);
    try {
      const res = await fetch("/api/payments/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          items: cartItemsPayload(),
          coupon: coupon?.code ?? "",
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "تعذر بدء عملية الدفع");
      setSession({ orderNumber: d.orderNumber, amount: d.amount, description: d.description });

      await loadMoyasarAssets();
      if (!moyasarContainerRef.current || !window.Moyasar) throw new Error("تعذر تهيئة نموذج الدفع");
      moyasarContainerRef.current.innerHTML = "";

      window.Moyasar.init({
        element: ".mysr-form",
        amount: d.amount,
        currency: d.currency,
        description: d.description,
        publishable_api_key: gateway.publishableKey,
        callback_url: `${window.location.origin}/payment/return?order=${d.orderNumber}`,
        methods: ["creditcard", "applepay", "stcpay"],
        supported_networks: ["visa", "mastercard", "mada", "amex"],
        metadata: { order: d.orderNumber },
        on_completed: async (payment: { id: string }) => {
          await fetch("/api/payments/attach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber: d.orderNumber, paymentId: payment.id }),
          });
        },
      });
      setFormMounted(true);
      setTimeout(() => moyasarContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر بدء عملية الدفع");
    } finally {
      setStartingSession(false);
    }
  };

  /* ---------------- sandbox fallback flow ---------------- */
  const submitSandbox = async (e: FormEvent) => {
    e.preventDefault();
    const v = contactValid();
    if (v) return setError(v);
    if (method !== "applepay") {
      if (!luhnValid(cardNumber)) return setError("رقم البطاقة غير صالح");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return setError("تاريخ الانتهاء بصيغة MM/YY");
      if (!/^\d{3,4}$/.test(cvc)) return setError("رمز الأمان CVC غير صالح");
      if (holder.trim().length < 3) return setError("اسم حامل البطاقة مطلوب");
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          paymentMethod: method,
          items: cartItemsPayload(),
          coupon: coupon?.code ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر إتمام الطلب");
      try {
        sessionStorage.setItem(`msbar_order_${data.orderNumber}`, JSON.stringify({ orderNumber: data.orderNumber, email: data.email, ts: Date.now() }));
      } catch {
        /* ignore */
      }
      cart.clear();
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إتمام الطلب");
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && !loading && !session) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="text-3xl font-bold">لا يوجد طلب لإتمامه</h1>
        <p className="text-ink-300 mt-4">أضف منتجات إلى السلة أولًا ثم عد لإتمام الدفع.</p>
        <Link href="/shop" className="btn-primary inline-flex px-8 py-4 rounded-2xl font-bold mt-8">تصفح المتجر</Link>
      </div>
    );
  }

  const liveGateway = gateway?.enabled === true;
  const effectiveTotal = coupon ? coupon.total : cart.subtotal;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-neon-400 mb-6">
        <ArrowLeft className="w-4 h-4 rotate-180" />
        العودة للسلة
      </Link>
      <p className="font-latin text-xs tracking-[0.4em] text-neon-400 mb-3">CHECKOUT</p>
      <h1 className="text-4xl sm:text-5xl font-bold mb-10">إتمام الطلب</h1>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        <div className="space-y-6">
          {/* contact */}
          <section className="glass rounded-3xl p-7">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-3">
              <span className="grid place-items-center w-8 h-8 rounded-xl bg-neon-400/15 text-neon-400 text-sm font-bold font-latin">1</span>
              بيانات التسليم
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ink-300 mb-2">الاسم الكامل *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="محمد العتيبي" disabled={!!session} />
              </div>
              <div>
                <label className="block text-xs text-ink-300 mb-2">البريد الإلكتروني *</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" className="field text-left" placeholder="you@email.com" disabled={!!session} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-ink-300 mb-2">رقم الجوال (اختياري)</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="field text-left" placeholder="05xxxxxxxx" disabled={!!session} />
              </div>
            </div>
            <p className="mt-4 text-[11px] text-ink-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              تُرسل مفاتيح التفعيل والفاتورة إلى بريدك مباشرة — تأكد من كتابته بشكل صحيح.
            </p>
          </section>

          {/* payment */}
          <section className="glass rounded-3xl p-7">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-3">
              <span className="grid place-items-center w-8 h-8 rounded-xl bg-neon-400/15 text-neon-400 text-sm font-bold font-latin">2</span>
              طريقة الدفع
              {liveGateway && (
                <span className="ms-auto text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <BadgeDollarSign className="w-3.5 h-3.5" />
                  بوابة ميسّر — مدى / فيزا / Apple Pay / STC Pay
                </span>
              )}
            </h2>

            {gateway === null ? (
              <div className="py-10 grid place-items-center">
                <Loader2 className="w-7 h-7 animate-spin text-neon-400" />
              </div>
            ) : liveGateway ? (
              <div>
                <div ref={moyasarContainerRef} className="mysr-form min-h-[80px]" />
                {!formMounted && (
                  <button
                    onClick={startMoyasar}
                    disabled={startingSession}
                    className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 disabled:opacity-70"
                  >
                    {startingSession ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جارٍ تهيئة الدفع الآمن…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4.5 h-4.5" />
                        المتابعة إلى الدفع الآمن — {formatSAR(effectiveTotal)}
                      </>
                    )}
                  </button>
                )}
                {session && (
                  <p className="mt-4 text-[11px] text-ink-300 text-center font-latin">
                    Order <span className="text-neon-400">{session.orderNumber}</span> — complete the payment in the secure form above
                  </p>
                )}
                <p className="mt-5 text-[11px] text-ink-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  الدفع يتم عبر بوابة ميسّر المرخصة من البنك المركزي السعودي — بيانات بطاقتك لا تمر على خوادمنا إطلاقًا.
                </p>
              </div>
            ) : (
              <form onSubmit={submitSandbox}>
                <div className="rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-gold mb-6">
                  وضع تجريبي — لم يتم ربط مفاتيح بوابة الدفع بعد. لن يُخصم أي مبلغ حقيقي.
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { id: "card", label: "بطاقة بنكية", icon: CreditCard },
                    { id: "mada", label: "مدى", icon: BadgeCheck },
                    { id: "applepay", label: "Apple Pay", icon: Smartphone },
                  ] as const).map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-sm font-semibold flex flex-col items-center gap-2.5 transition-all",
                        method === m.id ? "chip-active" : "border-white/10 text-ink-200 hover:border-white/25"
                      )}
                    >
                      <m.icon className="w-5 h-5" />
                      {m.label}
                    </button>
                  ))}
                </div>

                {method !== "applepay" ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-ink-300 mb-2">رقم البطاقة *</label>
                      <input
                        value={cardPreview}
                        onChange={(e) => setCardNumber(e.target.value)}
                        inputMode="numeric"
                        dir="ltr"
                        className="field text-left font-latin tracking-widest"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-ink-300 mb-2">اسم حامل البطاقة *</label>
                      <input value={holder} onChange={(e) => setHolder(e.target.value)} dir="ltr" className="field text-left" placeholder="MOHAMMED ALOTAIBI" />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-300 mb-2">تاريخ الانتهاء *</label>
                      <input
                        value={expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                          setExpiry(v);
                        }}
                        dir="ltr"
                        inputMode="numeric"
                        className="field text-left font-latin"
                        placeholder="12/28"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-300 mb-2">رمز الأمان CVC *</label>
                      <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} dir="ltr" inputMode="numeric" className="field text-left font-latin" placeholder="123" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-ink-300">
                    سيُطلب تأكيد الدفع من جهازك عبر Apple Pay بعد الضغط على «تأكيد الطلب».
                  </div>
                )}

                <p className="mt-5 text-[11px] text-ink-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  بيئة دفع تجريبية آمنة — لن يتم خصم أي مبلغ حقيقي، ولا تُخزَّن بيانات البطاقة مطلقًا.
                </p>

                <button type="submit" disabled={loading} className="btn-primary w-full mt-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 disabled:opacity-70">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جارٍ معالجة الدفع الآمن…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4.5 h-4.5" />
                      تأكيد الطلب — {formatSAR(effectiveTotal)}
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* summary */}
        <aside className="glass rounded-3xl p-7 lg:sticky lg:top-28">
          <h2 className="font-bold text-xl mb-6">طلبك</h2>
          <ul className="space-y-4 mb-6">
            {cart.items.map((i) => (
              <li key={i.slug} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-200">
                  {i.name}
                  <span className="text-ink-300 font-latin text-xs"> × {i.qty}</span>
                </span>
                <span className="font-latin font-semibold">{formatSAR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          {/* coupon */}
          <div className="mb-5">
            {coupon ? (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-emerald-300">
                  <TicketPercent className="w-4 h-4" />
                  {coupon.code}
                  <span className="text-emerald-200/70 font-normal">-{formatSAR(coupon.discount)}</span>
                </span>
                <button onClick={removeCoupon} className="text-ink-300 hover:text-red-400" aria-label="إزالة الكوبون">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="كود الخصم"
                  className="field flex-1 uppercase font-latin tracking-wider text-left"
                  dir="ltr"
                  disabled={!!session}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !!session}
                  className="btn-ghost rounded-xl px-4 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <TicketPercent className="w-4 h-4" />}
                  تطبيق
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-ink-300">
              <span>رسوم التسليم الرقمي</span>
              <span className="text-emerald-400 font-semibold">مجانًا</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-emerald-300">
                <span>الخصم ({coupon.code})</span>
                <span className="font-semibold">-{formatSAR(coupon.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2">
              <span className="font-bold">الإجمالي</span>
              <span className="text-3xl font-bold font-latin text-gradient">{formatSAR(effectiveTotal)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2.5">
              <CircleAlert className="w-4.5 h-4.5 shrink-0" />
              {error}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
