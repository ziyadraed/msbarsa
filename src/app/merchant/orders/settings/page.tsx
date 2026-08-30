"use client";

import { useEffect, useState } from "react";
import { Settings2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function OrderSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    autoAccept: true, confirmEmails: true, minQty: 1,
    autoRefund: false, notesRequired: false, cancelWindow: 24,
  });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        autoAccept: s.orderAutoAccept !== false,
        confirmEmails: s.orderConfirmEmails !== false,
        minQty: Number(s.orderMinQty ?? 1),
        autoRefund: s.orderAutoRefund === true,
        notesRequired: s.orderNotesRequired === true,
        cancelWindow: Number(s.orderCancelWindow ?? 24),
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: {
          orderAutoAccept: form.autoAccept, orderConfirmEmails: form.confirmEmails,
          orderMinQty: Number(form.minQty), orderAutoRefund: form.autoRefund,
          orderNotesRequired: form.notesRequired, orderCancelWindow: Number(form.cancelWindow),
        } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الطلبات");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

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
      <div><h2 className="text-2xl font-bold">إعدادات الطلبات</h2><p className="text-sm text-ink-300 mt-1">تحكم في سلوك الطلبات في متجرك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-400/15 border border-teal-400/30"><Settings2 className="w-5 h-5 text-teal-400" /></span>
            <p className="font-bold text-sm">تفضيلات الطلب</p>
          </div>
          <Toggle label="قبول الطلبات تلقائيًا" desc="قبول الطلبات المدفوعة دون مراجعة" val={form.autoAccept} onChange={() => setForm({ ...form, autoAccept: !form.autoAccept })} />
          <Toggle label="إرسال بريد تأكيد" desc="إرسال تأكيد الطلب للعميل" val={form.confirmEmails} onChange={() => setForm({ ...form, confirmEmails: !form.confirmEmails })} />
          <Toggle label="استرداد تلقائي" desc="استرداد تلقائي عند الإلغاء" val={form.autoRefund} onChange={() => setForm({ ...form, autoRefund: !form.autoRefund })} />
          <Toggle label="مطالبة بملاحظة" desc="الطلب بملاحظة اختيارية من العميل" val={form.notesRequired} onChange={() => setForm({ ...form, notesRequired: !form.notesRequired })} />
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <label className="block">
              <span className={lbl}>الحد الأدنى للكمية</span>
              <input type="number" className={inp} min={1} value={form.minQty} onChange={(e) => setForm({ ...form, minQty: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={lbl}>نافذة الإلغاء (ساعة)</span>
              <input type="number" className={inp} min={1} value={form.cancelWindow} onChange={(e) => setForm({ ...form, cancelWindow: Number(e.target.value) })} />
            </label>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 mt-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
