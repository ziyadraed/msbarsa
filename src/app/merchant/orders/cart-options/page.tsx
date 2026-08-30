"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function CartOptionsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ gift: true, notes: true, qtyStepper: true, promo: true });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        gift: s.cartGift !== false, notes: s.cartNotes !== false,
        qtyStepper: s.cartQtyStepper !== false, promo: s.cartPromo !== false,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { cartGift: form.gift, cartNotes: form.notes, cartQtyStepper: form.qtyStepper, cartPromo: form.promo } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ خيارات السلة");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ label, desc, val, onChange }: { label: string; desc: string; val: boolean; onChange: () => void }) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
        <div><p className="text-sm font-semibold">{label}</p><p className="text-[11px] text-ink-300">{desc}</p></div>
        <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${val ? "bg-neon-500" : "bg-white/15"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${val ? "right-0.5" : "right-5.5"}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">خيارات الطلب في السلة</h2><p className="text-sm text-ink-300 mt-1">تحكم بالخيارات المتاحة للعميل داخل السلة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><ShoppingCart className="w-5 h-5 text-sky-400" /></span>
            <p className="font-bold text-sm">خيارات السلة</p>
          </div>
          <Toggle label="خيار الهدية" desc="إمكانية إهداء الطلب" val={form.gift} onChange={() => setForm({ ...form, gift: !form.gift })} />
          <Toggle label="ملاحظة الطلب" desc="حقل ملاحظات اختياري" val={form.notes} onChange={() => setForm({ ...form, notes: !form.notes })} />
          <Toggle label="محدد الكمية" desc="زر +/- لكمية المنتج" val={form.qtyStepper} onChange={() => setForm({ ...form, qtyStepper: !form.qtyStepper })} />
          <Toggle label="حقل كوبون" desc="إدخال كود خصم" val={form.promo} onChange={() => setForm({ ...form, promo: !form.promo })} />
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
