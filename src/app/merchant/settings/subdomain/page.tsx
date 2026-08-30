"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2, Save, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const BASE = "msbarsa.shop";

export default function SubdomainPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setSlug(String(s.subdomain ?? d.store?.subdomain ?? ""));
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const clean = slug.trim().replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { subdomain: clean } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      setSlug(clean);
      toast.success("تم حفظ الدومين الفرعي");
    } finally {
      setSaving(false);
    }
  }

  const valid = slug.trim() && /^[a-zA-Z0-9-]{3,}$/.test(slug.trim());
  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">الدومين الفرعي</h2>
        <p className="text-sm text-ink-300 mt-1">رابط متجرك المجاني من منصة مسبار</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30">
              <Globe className="w-5 h-5 text-sky-400" />
            </span>
            <div>
              <p className="font-bold text-sm">رابط متجرك</p>
              <p className="text-[11px] text-ink-300 font-latin">{slug || "yourstore"}.{BASE}</p>
            </div>
          </div>

          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">اختر اسم دومينك الفرعي</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2.5 focus-within:border-neon-400/50">
              <input className="flex-1 bg-transparent outline-none text-sm font-latin text-left" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="yourstore" />
              <span className="text-xs text-ink-300 font-latin">.{BASE}</span>
              {valid && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>
          </label>

          {!valid && slug.length > 0 && (
            <p className="flex items-center gap-2 text-xs text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> 3 أحرف أو أكثر، أحرف إنجليزية وأرقام وشرطات فقط</p>
          )}

          <button type="submit" disabled={saving || !valid} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الرابط
          </button>
        </form>
      )}
    </div>
  );
}
