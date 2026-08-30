"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2, Save, Lock } from "lucide-react";
import { toast } from "sonner";

export default function PayPalPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, clientId: "", secret: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({ enabled: s.paypalEnabled === true, clientId: String(s.paypalClientId ?? ""), secret: String(s.paypalSecret ?? "") });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { paypalEnabled: form.enabled, paypalClientId: form.clientId, paypalSecret: form.secret } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات PayPal");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50 disabled:opacity-50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">PayPal</h2><p className="text-sm text-ink-300 mt-1">استقبال المدفوعات الدولية عبر PayPal</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-400/15 border border-blue-400/30"><Globe className="w-5 h-5 text-blue-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل PayPal</p><p className="text-[11px] text-ink-300">للعملاء حول العالم</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-blue-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <label className="block">
            <span className={lbl}>Client ID</span>
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-ink-300 shrink-0" /><input className={inp + " font-latin text-left"} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} disabled={!form.enabled} placeholder="AQxxxx..." /></div>
          </label>
          <label className="block">
            <span className={lbl}>Secret</span>
            <input type="password" className={inp + " font-latin text-left"} value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} disabled={!form.enabled} placeholder="••••••••" />
          </label>
          <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
