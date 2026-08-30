"use client";

import { useEffect, useState } from "react";
import { Mail, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function DomainEmailPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [domain, setDomain] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setDomain(String(s.domainEmailDomain ?? ""));
      if (Array.isArray(s.domainEmailAliases)) setAliases(s.domainEmailAliases as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { domainEmailDomain: domain, domainEmailAliases: aliases } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ بريد الدومين");
    } finally {
      setSaving(false);
    }
  }

  function addAlias() {
    setAliases((p) => (p.includes(domain.trim()) ? p : [...p, domain.trim()]));
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">بريد الدومين</h2>
        <p className="text-sm text-ink-300 mt-1">عناوين بريد برسالة دومينك المخصص</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30">
              <Mail className="w-5 h-5 text-emerald-400" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm">عناوين بريد موحّدة</p>
              <p className="text-[11px] text-ink-300">مثال: support@{domain}</p>
            </div>
          </div>

          <label className="block">
            <span className={lbl}>الدومين</span>
            <input className={inp + " font-latin text-left"} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourstore.com" dir="ltr" />
          </label>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-ink-300">العناوين المسجّلة</span>
              <button type="button" onClick={addAlias} disabled={!domain.trim()} className="flex items-center gap-1 text-xs text-neon-400 font-semibold disabled:opacity-50">
                <Plus className="w-3.5 h-3.5" /> إضافة
              </button>
            </div>
            <div className="space-y-2">
              {aliases.length === 0 ? (
                <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد عناوين بعد — أضف العنوان الرئيسي</p>
              ) : aliases.map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5">
                  <Mail className="w-4 h-4 text-ink-300 shrink-0" />
                  <span className="flex-1 text-sm font-latin text-left">{a}</span>
                  <button type="button" onClick={() => setAliases((p) => p.filter((_, j) => j !== i))} className="text-ink-300 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
