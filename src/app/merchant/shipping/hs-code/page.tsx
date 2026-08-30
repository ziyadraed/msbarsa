"use client";

import { useEffect, useState } from "react";
import { Hash, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Hs = { id: string; code: string; desc: string };

export default function HsCodePage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState<Hs[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.hsCodes)) setCodes(s.hsCodes as Hs[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { hsCodes: codes } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ أكواد HS");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">HS Code</h2><p className="text-sm text-ink-300 mt-1">أكواد التصنيف الجمركي الموحد للشحن الدولي</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Hash className="w-5 h-5 text-emerald-400" /></span>
              <p className="font-bold text-sm">{codes.length} كود</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {codes.map((c) => (
              <div key={c.id} className="grid grid-cols-[auto_1fr_auto] gap-2 items-center rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <input className={inp + " w-28 font-latin text-left"} value={c.code} onChange={(e) => setCodes((p) => p.map((x) => x.id === c.id ? { ...x, code: e.target.value } : x))} placeholder="4901.10" />
                <input className={inp} value={c.desc} onChange={(e) => setCodes((p) => p.map((x) => x.id === c.id ? { ...x, desc: e.target.value } : x))} placeholder="وصف المنتج" />
                <button type="button" onClick={() => setCodes((p) => p.filter((x) => x.id !== c.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {codes.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد أكواد</p>}
          </div>
          <button type="button" onClick={() => setCodes((p) => [...p, { id: crypto.randomUUID(), code: "", desc: "" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة كود HS
          </button>
        </div>
      )}
    </div>
  );
}
