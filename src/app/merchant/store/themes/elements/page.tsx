"use client";

import { useEffect, useState } from "react";
import { LayoutTemplate, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type El = { id: string; name: string; type: string; enabled: boolean };

export default function ThemeElementsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [els, setEls] = useState<El[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.themeElements)) setEls(s.themeElements as El[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { themeElements: els } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ عناصر الثيم");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">عناصر الثيم</h2><p className="text-sm text-ink-300 mt-1">تحكم بالعناصر التفاعلية في ثيم متجرك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><LayoutTemplate className="w-5 h-5 text-sky-400" /></span>
              <p className="font-bold text-sm">{els.length} عنصر</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {els.map((e) => (
              <div key={e.id} className="grid grid-cols-[1.2fr_1fr_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp} value={e.name} onChange={(ev) => setEls((p) => p.map((x) => x.id === e.id ? { ...x, name: ev.target.value } : x))} />
                <input className={inp} value={e.type} onChange={(ev) => setEls((p) => p.map((x) => x.id === e.id ? { ...x, type: ev.target.value } : x))} placeholder="النوع" />
                <button type="button" onClick={() => setEls((p) => p.map((x) => x.id === e.id ? { ...x, enabled: !x.enabled } : x))} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${e.enabled ? "bg-emerald-400/15 text-emerald-400" : "bg-white/10 text-ink-300"}`}>{e.enabled ? "مفعّل" : "متوقف"}</button>
              </div>
            ))}
            {els.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد عناصر</p>}
          </div>
          <button type="button" onClick={() => setEls((p) => [...p, { id: crypto.randomUUID(), name: "", type: "button", enabled: true }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة عنصر
          </button>
        </div>
      )}
    </div>
  );
}
