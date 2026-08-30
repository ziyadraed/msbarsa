"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Save, Plus, Pencil, Trash2, CalendarClock } from "lucide-react";
import { toast } from "sonner";

type Copy = { id: string; name: string; active: boolean; scheduled?: string };

export default function ThemeCopiesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copies, setCopies] = useState<Copy[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.themeCopies)) setCopies(s.themeCopies as Copy[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { themeCopies: copies } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ نسخ الثيم");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">إدارة نسخ الثيم</h2><p className="text-sm text-ink-300 mt-1">نسخ، تخصيص، جدولة تفعيل</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><Copy className="w-5 h-5 text-viol-400" /></span>
              <p className="font-bold text-sm">{copies.length} نسخة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {copies.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/40 p-2.5">
                <Pencil className="w-4 h-4 text-ink-300 shrink-0" />
                <input className={inp + " flex-1"} value={c.name} onChange={(e) => setCopies((p) => p.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} />
                <button type="button" onClick={() => setCopies((p) => p.map((x) => x.id === c.id ? { ...x, active: !x.active } : x))} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${c.active ? "bg-emerald-400/15 text-emerald-400" : "bg-white/10 text-ink-300"}`}>{c.active ? "مفعّلة" : "غير مفعّلة"}</button>
                <button type="button" onClick={() => setCopies((p) => p.filter((x) => x.id !== c.id))} className="text-ink-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {copies.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد نسخ</p>}
          </div>
          <button type="button" onClick={() => setCopies((p) => [...p, { id: crypto.randomUUID(), name: "نسخة جديدة", active: false }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إنشاء نسخة
          </button>
        </div>
      )}
    </div>
  );
}
