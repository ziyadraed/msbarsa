"use client";

import { useEffect, useState } from "react";
import { Apple, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AppleWalletPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, autoAdd: true });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({ enabled: s.walletEnabled === true, autoAdd: s.walletAutoAdd !== false });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { walletEnabled: form.enabled, walletAutoAdd: form.autoAdd } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات تتبع Apple Wallet");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">تتبع الطلب من Apple Wallet</h2><p className="text-sm text-ink-300 mt-1">اضبط رزمة تتبع الطلب لعملاء Apple</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-zinc-500/25 to-gray-400/15 border border-white/10"><Apple className="w-5 h-5 text-zinc-300" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل تتبع Apple Wallet</p><p className="text-[11px] text-ink-300">بطاقة تتبع الطلب في محفظة Apple</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-neutral-400" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <button type="button" onClick={() => setForm({ ...form, autoAdd: !form.autoAdd })} disabled={!form.enabled} className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3 text-right disabled:opacity-50">
            <span className="text-sm font-semibold">إضافة تلقائية عند الشراء</span>
            <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.autoAdd ? "bg-neon-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.autoAdd ? "right-0.5" : "right-5.5"}`} />
            </span>
          </button>
          <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
