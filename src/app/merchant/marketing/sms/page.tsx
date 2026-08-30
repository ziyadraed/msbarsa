"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SmsCampaignPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: false, sender: "MSBARSA", message: "", audience: "all" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({ enabled: s.smsEnabled === true, sender: String(s.smsSender ?? "MSBARSA"), message: String(s.smsMessage ?? ""), audience: String(s.smsAudience ?? "all") });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { smsEnabled: form.enabled, smsSender: form.sender, smsMessage: form.message, smsAudience: form.audience } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات حملة SMS");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50 disabled:opacity-50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">الحملات عبر SMS</h2><p className="text-sm text-ink-300 mt-1">أرسل رسائل تسويقية للعملاء عبر الجوال</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><MessageSquareText className="w-5 h-5 text-emerald-400" /></span>
            <div className="flex-1"><p className="font-bold text-sm">تفعيل حملات SMS</p><p className="text-[11px] text-ink-300">رسائل قصيرة للعملاء</p></div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${form.enabled ? "bg-emerald-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={lbl}>اسم المرسل</span>
              <input className={inp + " font-latin text-left"} value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} disabled={!form.enabled} maxLength={11} />
            </label>
            <label className="block">
              <span className={lbl}>الجمهور</span>
              <select className={inp} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} disabled={!form.enabled}>
                <option value="all">جميع العملاء</option><option value="repeat">العملاء المكررون</option><option value="new">العملاء الجدد</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className={lbl}>نص الرسالة</span>
            <textarea className={inp} rows={3} maxLength={160} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} disabled={!form.enabled} placeholder="عرض خاص لك! خصم 20%..." />
            <span className="text-[10px] text-ink-300 mt-1 block text-left">{form.message.length}/160</span>
          </label>
          <button type="submit" disabled={saving || !form.enabled} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
