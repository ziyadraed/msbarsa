"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function InvoiceEditorPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ header: "فاتورة", showTax: true, showDiscount: true, footer: "شكرًا لتسوقك معنا", bank: false });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        header: String(s.invoiceHeader ?? "فاتورة"),
        showTax: s.invoiceShowTax !== false,
        showDiscount: s.invoiceShowDiscount !== false,
        footer: String(s.invoiceFooter ?? "شكرًا لتسوقك معنا"),
        bank: s.invoiceBank === true,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { invoiceHeader: form.header, invoiceShowTax: form.showTax, invoiceShowDiscount: form.showDiscount, invoiceFooter: form.footer, invoiceBank: form.bank } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ قالب الفاتورة");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  function Toggle({ label, val, onChange }: { label: string; val: boolean; onChange: () => void }) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
        <span className="text-sm font-semibold">{label}</span>
        <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${val ? "bg-neon-500" : "bg-white/15"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${val ? "right-0.5" : "right-5.5"}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">محرر فواتير المتجر</h2><p className="text-sm text-ink-300 mt-1">خصّص مظهر الفواتير المرسلة لعملائك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><FileSpreadsheet className="w-5 h-5 text-emerald-400" /></span>
            <p className="font-bold text-sm">قالب الفاتورة</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={lbl}>عنوان الفاتورة</span>
              <input className={inp} value={form.header} onChange={(e) => setForm({ ...form, header: e.target.value })} />
            </label>
            <label className="block">
              <span className={lbl}>التذييل</span>
              <input className={inp} value={form.footer} onChange={(e) => setForm({ ...form, footer: e.target.value })} />
            </label>
          </div>
          <div className="space-y-2">
            <Toggle label="إظهار الضريبة" val={form.showTax} onChange={() => setForm({ ...form, showTax: !form.showTax })} />
            <Toggle label="إظهار الخصم" val={form.showDiscount} onChange={() => setForm({ ...form, showDiscount: !form.showDiscount })} />
            <Toggle label="إظهار بيانات الحساب البنكي" val={form.bank} onChange={() => setForm({ ...form, bank: !form.bank })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ القالب
          </button>
        </form>
      )}
    </div>
  );
}
