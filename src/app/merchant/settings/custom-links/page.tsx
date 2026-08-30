"use client";

import { useEffect, useState } from "react";
import { Link2, Loader2, Save, Plus, X, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";

type Link = { label: string; url: string; openNew: boolean };

export default function CustomLinksPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.customLinks)) setLinks(s.customLinks as Link[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { customLinks: links } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الروابط المخصصة");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1";

  function move(i: number, dir: -1 | 1) {
    setLinks((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const copy = [...p]; [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">الروابط المخصصة</h2>
        <p className="text-sm text-ink-300 mt-1">أضف روابط مخصصة تظهر في قائمة متجرك</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30">
                <Link2 className="w-5 h-5 text-viol-400" />
              </span>
              <div>
                <p className="font-bold text-sm">روابط القائمة</p>
                <p className="text-[11px] text-ink-300">{links.length} رابط</p>
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>

          <div className="space-y-3">
            {links.length === 0 && (
              <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-4 text-center">لا توجد روابط بعد — أضف أول رابط</p>
            )}
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} className="text-ink-300 hover:text-neon-400 disabled:opacity-30" disabled={i === 0}><MoveUp className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="text-ink-300 hover:text-neon-400 disabled:opacity-30" disabled={i === links.length - 1}><MoveDown className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex-1 grid sm:grid-cols-[1fr_1.4fr_auto] gap-2">
                  <input className={inp} value={l.label} onChange={(e) => setLinks((p) => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="اسم الرابط" />
                  <input className={inp + " font-latin text-left"} value={l.url} onChange={(e) => setLinks((p) => p.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} placeholder="https://..." dir="ltr" />
                  <label className="flex items-center gap-1.5 text-[11px] text-ink-300">
                    <input type="checkbox" checked={l.openNew} onChange={(e) => setLinks((p) => p.map((x, j) => j === i ? { ...x, openNew: e.target.checked } : x))} />
                    نافذة جديدة
                  </label>
                </div>
                <button type="button" onClick={() => setLinks((p) => p.filter((_, j) => j !== i))} className="text-ink-300 hover:text-red-400 shrink-0"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setLinks((p) => [...p, { label: "", url: "", openNew: false }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400 hover:border-neon-400/40">
            <Plus className="w-4 h-4" /> إضافة رابط
          </button>
        </div>
      )}
    </div>
  );
}
