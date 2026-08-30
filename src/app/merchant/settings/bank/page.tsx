"use client";

import { useEffect, useState } from "react";
import { Landmark, Loader2, Save, Banknote, User } from "lucide-react";
import { toast } from "sonner";

export default function BankAccountPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, holder: "", bank: "", iban: "", note: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.bankEnabled === true,
        holder: String(s.bankHolder ?? ""),
        bank: String(s.bankName ?? ""),
        iban: String(s.bankIban ?? ""),
        note: String(s.bankNote ?? ""),
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: {
          bankEnabled: form.enabled, bankHolder: form.holder, bankName: form.bank,
          bankIban: form.iban, bankNote: form.note,
        } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الحساب البنكي");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">الحساب البنكي</h2>
        <p className="text-sm text-ink-300 mt-1">بياناتك البنكية لاستقبال الحوالات والتحويلات</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-400/15 border border-blue-400/30">
              <Landmark className="w-5 h-5 text-blue-400" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm">حساب استقبال التحويلات</p>
              <p className="text-[11px] text-ink-300">يظهر للعملاء عند اختيار التحويل البنكي</p>
            </div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-blue-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={lbl}>اسم المستفيد</span>
              <input className={inp} value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} disabled={!form.enabled} placeholder="مثال: متجر مسبار" />
            </label>
            <label className="block">
              <span className={lbl}>اسم البنك</span>
              <input className={inp} value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} disabled={!form.enabled} placeholder="البنك الأهلي" />
            </label>
            <label className="block sm:col-span-2">
              <span className={lbl}>رقم الآيبان (IBAN)</span>
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-ink-300 shrink-0" />
                <input className={inp + " font-latin text-left"} value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} disabled={!form.enabled} placeholder="SA00 0000 0000 0000 0000 0000" dir="ltr" />
              </div>
            </label>
            <label className="block sm:col-span-2">
              <span className={lbl}>ملاحظة إضافية</span>
              <textarea className={inp} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} disabled={!form.enabled} placeholder="أي تعليمات يراها العميل عند التحويل" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-ink-300">
              <User className="w-3.5 h-3.5" /> {form.enabled ? "التحويل البنكي مفعّل للعملاء" : "التحويل البنكي متوقف"}
            </div>
            <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
