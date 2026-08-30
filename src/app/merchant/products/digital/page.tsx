"use client";

import { useEffect, useState } from "react";
import { FileCode, Loader2, Save, Plus, X, Download } from "lucide-react";
import { toast } from "sonner";

type Field = { id: string; label: string; value: string };

export default function DigitalProductPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, stock: 100, deliveryType: "download", fileName: "", licenseKeys: "", customFields: [] as Field[] });

  useEffect(() => {
    fetch("/api/merchant/products?limit=1&type=digital").then((r) => r.json()).then((d) => {
      const p = Array.isArray(d.products) ? d.products[0] : undefined;
      if (p) {
        setForm({ name: p.name || "", price: p.price ?? 0, stock: p.stock ?? 0, deliveryType: "download", fileName: "", licenseKeys: "", customFields: [] as Field[] });
      }
    }).finally(() => setLoaded(true));
  }, []);

  async function create() {
    if (!form.name.trim()) return toast.error("أدخل اسم المنتج");
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, type: "digital", price: Number(form.price), stock: Number(form.stock),
          categorySlug: "digital", customFields: form.customFields,
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الإنشاء");
      toast.success("تم إنشاء المنتج الرقمي");
      setForm({ name: "", price: 0, stock: 100, deliveryType: "download", fileName: "", licenseKeys: "", customFields: [] });
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">إضافة منتج رقمي</h2><p className="text-sm text-ink-300 mt-1">منتج يُسلَّم إلكترونيًا (ملف أو رخصة)</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><FileCode className="w-5 h-5 text-viol-400" /></span>
            <div><p className="font-bold text-sm">منتج رقمي جديد</p><p className="text-[11px] text-ink-300">يُسلَّم تلقائيًا بعد الدفع</p></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className={lbl}>اسم المنتج</span>
              <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: كتاب إلكتروني" />
            </label>
            <label className="block">
              <span className={lbl}>السعر (ر.س)</span>
              <input type="number" className={inp} min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={lbl}>المخزون</span>
              <input type="number" className={inp} min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </label>
          </div>

          <div>
            <span className={lbl}>طريقة التسليم</span>
            <div className="flex gap-2">
              {[{ v: "download", label: "تحميل ملف" }, { v: "license", label: "رخصة برمجية" }].map((o) => (
                <button key={o.v} type="button" onClick={() => setForm({ ...form, deliveryType: o.v })} className={`px-4 py-2 rounded-xl text-xs font-bold border ${form.deliveryType === o.v ? "bg-viol-400/15 text-viol-400 border-viol-400/30" : "bg-white/5 text-ink-300 border-white/10"}`}>{o.label}</button>
              ))}
            </div>
          </div>

          {form.deliveryType === "download" ? (
            <label className="block">
              <span className={lbl}>ملف المنتج</span>
              <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-ink-300 text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> ارفع ملفًا هنا أو <span className="text-neon-400">استعرض</span>
              </div>
            </label>
          ) : (
            <label className="block">
              <span className={lbl}>مفاتيح الترخيص (سطر لكل مفتاح)</span>
              <textarea className={inp} rows={3} value={form.licenseKeys} onChange={(e) => setForm({ ...form, licenseKeys: e.target.value })} placeholder={"XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY"} />
            </label>
          )}

          <button onClick={create} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} إنشاء المنتج
          </button>
        </div>
      )}
    </div>
  );
}
