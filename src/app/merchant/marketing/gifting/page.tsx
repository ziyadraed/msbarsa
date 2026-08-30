"use client";

import { useEffect, useState } from "react";
import { Gift, Loader2, Save, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function GiftingPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: true, customMessage: true, giftWrap: false });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.giftingEnabled !== false,
        customMessage: s.giftCustomMessage !== false,
        giftWrap: s.giftWrap === true,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { ...form, giftingEnabled: form.enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الإهداء");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">نظام الإهداء</h2>
        <p className="text-sm text-ink-300 mt-1">اسمح لعملائك بإهداء المنتجات الرقمية</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-rose-400/15 border border-pink-400/30">
                <Gift className="w-5 h-5 text-pink-400" />
              </span>
              <div>
                <p className="font-bold">تفعيل الإهداء</p>
                <p className="text-[11px] text-ink-300">إمكانية إرسال منتج كهدية لشخص آخر</p>
              </div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-pink-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { id: "customMessage" as const, label: "رسالة إهداء مخصصة", desc: "العميل يكتب رسالة تصل مع الهدية" },
              { id: "giftWrap" as const, label: "بطاقة إهداء أنيقة", desc: "إظهار بطاقة تهنئة عند الإرسال" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm({ ...form, [opt.id]: !form[opt.id] })}
                disabled={!form.enabled}
                className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-right disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-[11px] text-ink-300 mt-0.5">{opt.desc}</p>
                </div>
                <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form[opt.id] ? "bg-pink-500" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form[opt.id] ? "right-0.5" : "right-5.5"}`} />
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-xs text-ink-300 leading-6 flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <span>يُرسل المنتج المُهدى مباشرة إلى بريد المستلم بعد إتمام الدفع.</span>
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الإعدادات
          </button>
        </form>
      )}
    </div>
  );
}
