"use client";

import { useEffect, useState } from "react";
import { Bike, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Del = { id: string; name: string; phone: string; zone: string };

export default function DispatchersPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<Del[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.dispatchers)) setList(s.dispatchers as Del[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { dispatchers: list } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ المناديب");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">المناديب</h2><p className="text-sm text-ink-300 mt-1">فريق التوصيل الخاص بك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-400/15 border border-orange-400/30"><Bike className="w-5 h-5 text-orange-400" /></span>
              <p className="font-bold text-sm">{list.length} مندوب</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {list.map((d) => (
              <div key={d.id} className="space-y-2 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  <input className={inp} value={d.name} onChange={(e) => setList((p) => p.map((x) => x.id === d.id ? { ...x, name: e.target.value } : x))} placeholder="الاسم" />
                  <input className={inp + " font-latin text-left"} value={d.phone} onChange={(e) => setList((p) => p.map((x) => x.id === d.id ? { ...x, phone: e.target.value } : x))} placeholder="الجوال" />
                  <div className="flex gap-2">
                    <input className={inp + " flex-1"} value={d.zone} onChange={(e) => setList((p) => p.map((x) => x.id === d.id ? { ...x, zone: e.target.value } : x))} placeholder="المنطقة" />
                    <button type="button" onClick={() => setList((p) => p.filter((x) => x.id !== d.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا يوجد مناديب</p>}
          </div>
          <button type="button" onClick={() => setList((p) => [...p, { id: crypto.randomUUID(), name: "", phone: "", zone: "" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة مندوب
          </button>
        </div>
      )}
    </div>
  );
}
