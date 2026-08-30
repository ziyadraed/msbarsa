"use client";

import { useEffect, useState } from "react";
import { Truck, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const METHODS = [
  { id: "free", label: "شحن مجاني" },
  { id: "flat", label: "شحن ثابت" },
  { id: "per_product", label: "حسب المنتج" },
  { id: "courier", label: "توصيل سريع" },
];

export default function ShippingSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    freeShippingThreshold: "",
    flatRate: "",
    provider: "",
    enabled: true,
  });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) {
        const s = d.store.settings ?? {};
        setForm({
          freeShippingThreshold: String(s.freeShippingThreshold ?? ""),
          flatRate: String(s.flatRate ?? ""),
          provider: String(s.provider ?? ""),
          enabled: s.shippingEnabled !== false,
        });
      }
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "مسبار",
          design: {
            freeShippingThreshold: form.freeShippingThreshold,
            flatRate: form.flatRate,
            provider: form.provider,
            shippingEnabled: form.enabled,
          },
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الشحن");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">إعدادات الشحن</h2>
        <p className="text-sm text-ink-300 mt-1">حدد طرق وأسعار الشحن لمتجرك</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30">
                <Truck className="w-5 h-5 text-neon-400" />
              </span>
              <div>
                <p className="font-bold">طرق الشحن</p>
                <p className="text-[11px] text-ink-300">فعّل وحدد أسعار الشحن</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, enabled: !form.enabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-neon-500" : "bg-white/15"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">شحن مجاني عند طلب يزيد عن (ر.س)</span>
              <input className="inp" type="number" value={form.freeShippingThreshold} onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })} placeholder="200" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">سعر الشحن الثابت (ر.س)</span>
              <input className="inp" type="number" value={form.flatRate} onChange={(e) => setForm({ ...form, flatRate: e.target.value })} placeholder="25" />
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-xs text-ink-300 mb-1.5">شركة الشحن</span>
              <select className="inp" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                <option value="">اختر الشركة...</option>
                <option value="smsa">سمسا</option>
                <option value="aramex">أرامكس</option>
                <option value="dhl">DHL</option>
                <option value="inhouse">شحن ذاتي</option>
                <option value="digital">منتج رقمي (تسليم فوري)</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-sm text-ink-300 leading-7">
            <p className="font-semibold text-ink-100 mb-1">كيف يُحسب الشحن؟</p>
            هذه الإعدادات تحدد طريقة احتساب الشحن عند إتمام الطلب. يمكنك دائمًا تعديلها لاحقًا من هنا.
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الإعدادات
          </button>
        </form>
      )}
    </div>
  );
}
