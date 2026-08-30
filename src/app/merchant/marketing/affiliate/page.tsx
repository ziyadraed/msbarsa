"use client";

import { useEffect, useState } from "react";
import { Users2, Loader2, Save, Link2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AffiliatePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ enabled: true, commission: "10", minPayout: "100" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        enabled: s.affiliateEnabled !== false,
        commission: String(s.affiliateCommission ?? "10"),
        minPayout: String(s.affiliateMinPayout ?? "100"),
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { ...form, affiliateEnabled: form.enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات العمولة");
    } finally {
      setSaving(false);
    }
  }

  const affiliateLink = `https://msbarsa.vercel.app/?ref=${encodeURIComponent("msbarsa")}`;

  function copy() {
    navigator.clipboard.writeText(affiliateLink).then(() => toast.success("تم نسخ الرابط"));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">التسويق بالعمولة</h2>
        <p className="text-sm text-ink-300 mt-1">فعّل نظام العمولة ليتيح للمسوّقين الترويج لمتجرك</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30">
                <Users2 className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <p className="font-bold">تفعيل برنامج العمولة</p>
                <p className="text-[11px] text-ink-300">دع المسوّقين يربحون مقابل كل بيع</p>
              </div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-emerald-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "right-0.5" : "right-5.5"}`} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">نسبة العمولة (%)</span>
              <input className="inp" type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} disabled={!form.enabled} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الحد الأدنى للسحب (ر.س)</span>
              <input className="inp" type="number" value={form.minPayout} onChange={(e) => setForm({ ...form, minPayout: e.target.value })} disabled={!form.enabled} />
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4">
            <p className="text-xs text-ink-300 mb-2 flex items-center gap-1.5"><Link2 className="w-4 h-4 text-emerald-400" /> رابط التسويق الخاص بك</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-ink-900/70 rounded-xl px-3 py-2 font-latin text-xs text-emerald-400 break-all" dir="ltr">{affiliateLink}</code>
              <button type="button" onClick={copy} className="btn-ghost rounded-xl p-2.5"><Copy className="w-4 h-4" /></button>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الإعدادات
          </button>
        </form>
      )}
    </div>
  );
}
