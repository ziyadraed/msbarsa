"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2, Save, Link2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DomainPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subdomain: "msbarsa", customDomain: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) {
        setForm({
          subdomain: String(d.store.slug ?? "msbarsa"),
          customDomain: String(d.store.domain ?? ""),
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
          design: { customDomain: form.customDomain.trim() },
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات الدومين");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">دومين المتجر</h2>
        <p className="text-sm text-ink-300 mt-1">رابط متجرك والدومين المخصص</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30">
              <Globe className="w-5 h-5 text-neon-400" />
            </span>
            <div>
              <p className="font-bold">رابط متجرك</p>
              <p className="font-latin text-xs text-neon-400">{form.subdomain}.msbarsa.app</p>
            </div>
          </div>

          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">الدومين المخصص (اختياري)</span>
            <input className="inp font-latin" dir="ltr" value={form.customDomain} onChange={(e) => setForm({ ...form, customDomain: e.target.value })} placeholder="store.yourdomain.com" />
          </label>

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-sm">
            <p className="font-semibold text-ink-100 mb-2 flex items-center gap-2"><Link2 className="w-4 h-4 text-neon-400" /> لإضافة دومين مخصص</p>
            <ol className="text-xs text-ink-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>أنشئ سجل CNAME باسم <span className="font-latin text-neon-400">www</span> يشير إلى <span className="font-latin text-neon-400">cname.msbarsa.app</span></li>
              <li>أنشئ سجل A باسم <span className="font-latin text-neon-400">@</span> يشير إلى <span className="font-latin text-neon-400">76.76.21.21</span></li>
              <li>أدخل دومينك أعلاه واحفظ</li>
              <li>قد يستغرق تفعيل الشهادة (SSL) حتى 24 ساعة</li>
            </ol>
          </div>

          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
