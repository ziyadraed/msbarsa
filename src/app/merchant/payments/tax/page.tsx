"use client";

import { useEffect, useState } from "react";
import { Receipt, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function TaxPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    enabled: true,
    rate: "15",
    number: "",
    included: true,
  });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) {
        const s = d.store.settings ?? {};
        setForm({
          enabled: s.taxEnabled !== false,
          rate: String(s.taxRate ?? "15"),
          number: String(s.taxNumber ?? ""),
          included: s.taxIncluded !== false,
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
            taxEnabled: form.enabled,
            taxRate: form.rate,
            taxNumber: form.number,
            taxIncluded: form.included,
          },
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الضريبة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">إدارة الضرائب</h2>
        <p className="text-sm text-ink-300 mt-1">ضريبة القيمة المضافة على منتجات متجرك</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30">
                <Receipt className="w-5 h-5 text-neon-400" />
              </span>
              <div>
                <p className="font-bold">ضريبة القيمة المضافة (VAT)</p>
                <p className="text-[11px] text-ink-300">الضريبة السعودية القياسية 15%</p>
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
              <span className="block text-xs text-ink-300 mb-1.5">نسبة الضريبة (%)</span>
              <input className="inp" type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الرقم الضريبي</span>
              <input className="inp font-latin" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="3101..." />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, included: !form.included })}
            className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-right"
          >
            <div>
              <p className="text-sm font-semibold">الأسعار شاملة الضريبة</p>
              <p className="text-[11px] text-ink-300 mt-0.5">إن أُوقفت، تُضاف الضريبة على السعر عند إتمام الطلب</p>
            </div>
            <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.included ? "bg-neon-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.included ? "right-0.5" : "right-5.5"}`} />
            </span>
          </button>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الإعدادات
          </button>
        </form>
      )}
    </div>
  );
}
