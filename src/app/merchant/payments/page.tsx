"use client";

import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Landmark, Check, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const GATEWAYS = [
  { id: "mada", name: "مدى", desc: "المدفوعات المحلية عبر البطاقة البنكية", icon: Landmark },
  { id: "visa_master", name: "Visa / Mastercard", desc: "البطاقات الائتمانية والمدينة", icon: CreditCard },
  { id: "apple_pay", name: "Apple Pay", desc: "الدفع عبر الهواتف الذكية", icon: Smartphone },
];

export default function PaymentsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<string[]>([]);
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [envKeysConfigured, setEnvKeysConfigured] = useState(false);
  const [merchantConfigured, setMerchantConfigured] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/payments")
      .then((r) => r.json())
      .then((d) => {
        setActive(d.methods ?? []);
        setPublishableKey(d.publishableKey ?? "");
        setSecretKey(d.secretKey ?? "");
        setEnvKeysConfigured(d.envKeysConfigured);
        setMerchantConfigured(d.merchantConfigured);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function toggle(id: string) {
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methods: active, publishableKey, secretKey }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الدفع");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">طرق الدفع</h2>
          <p className="text-sm text-ink-300 mt-1">فعّل بوابات الدفع وأدخل مفاتيح بوابة «ميسّر» (Moyasar)</p>
        </div>
        <div className="flex items-center gap-3">
          {merchantConfigured && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> بوابة مفعّلة بمفاتيحك
            </span>
          )}
          {!merchantConfigured && envKeysConfigured && (
            <span className="text-[11px] font-bold text-sky-400 bg-sky-400/10 border border-sky-400/30 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> مفاتيح بيئة الخادم مفعّلة
            </span>
          )}
        </div>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...
        </div>
      ) : (
        <form onSubmit={save} className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GATEWAYS.map((g) => {
              const on = active.includes(g.id);
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => toggle(g.id)}
                  className={`glass rounded-3xl p-5 text-right hover-lift ${on ? "ring-1 ring-emerald-400/40" : "opacity-80"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`grid place-items-center w-11 h-11 rounded-2xl border ${on ? "bg-emerald-400/15 border-emerald-400/30" : "bg-white/5 border-white/10"}`}>
                      <g.icon className={`w-5 h-5 ${on ? "text-emerald-400" : "text-ink-300"}`} />
                    </span>
                    <span className={`relative w-10 h-5 rounded-full ${on ? "bg-emerald-500" : "bg-white/15"} transition-colors`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "right-0.5" : "right-5"}`} />
                    </span>
                  </div>
                  <p className="font-bold flex items-center gap-2">{g.name} {on && <Check className="w-4 h-4 text-emerald-400" />}</p>
                  <p className="text-xs text-ink-300 mt-1.5 leading-relaxed">{g.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-1">مفاتيح بوابة ميسّر (Moyasar)</h3>
            <p className="text-xs text-ink-300 mb-5">اختياري — إن تُركت فارغة وتوفّر مفاتيح بيئة، ستُستخدم مفاتيح الخادم.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ink-300 mb-2">المفتاح العام (publishable key)</label>
                <input value={publishableKey} onChange={(e) => setPublishableKey(e.target.value)} dir="ltr" className="field text-left font-latin" placeholder="pk_test_..." />
              </div>
              <div>
                <label className="block text-xs text-ink-300 mb-2">المفتاح السري (secret key)</label>
                <div className="relative">
                  <input
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    dir="ltr"
                    type={showSecret ? "text" : "password"}
                    className="field text-left font-latin pe-12"
                    placeholder="sk_test_..."
                  />
                  <button type="button" onClick={() => setShowSecret((v) => !v)} className="absolute top-1/2 -translate-y-1/2 end-3 text-ink-300 hover:text-neon-400" aria-label="إظهار/إخفاء المفتاح">
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-70">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              حفظ إعدادات الدفع
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
