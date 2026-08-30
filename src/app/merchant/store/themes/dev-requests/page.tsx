"use client";

import { useEffect, useState } from "react";
import { Hammer, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Req = { id: string; title: string; desc: string; status: string };

export default function DevRequestsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<Req[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.themeDevRequests)) setList(s.themeDevRequests as Req[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { themeDevRequests: list } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ طلبات التطوير");
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">طلبات تطوير الثيم</h2><p className="text-sm text-ink-300 mt-1">اطلب تخصيصات تطويرية من فريق مسبار</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-400/15 border border-orange-400/30"><Hammer className="w-5 h-5 text-orange-400" /></span>
              <p className="font-bold text-sm">{list.length} طلب</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {list.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-ink-900/40 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inp + " flex-1"} value={r.title} onChange={(e) => setList((p) => p.map((x) => x.id === r.id ? { ...x, title: e.target.value } : x))} placeholder="عنوان الطلب" />
                  <select className={inp + " w-32"} value={r.status} onChange={(e) => setList((p) => p.map((x) => x.id === r.id ? { ...x, status: e.target.value } : x))}>
                    <option>معلق</option><option>قيد التنفيذ</option><option>منجز</option>
                  </select>
                  <button type="button" onClick={() => setList((p) => p.filter((x) => x.id !== r.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
                <input className={inp} value={r.desc} onChange={(e) => setList((p) => p.map((x) => x.id === r.id ? { ...x, desc: e.target.value } : x))} placeholder="تفاصيل الطلب" />
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد طلبات</p>}
          </div>
          <button type="button" onClick={() => setList((p) => [...p, { id: crypto.randomUUID(), title: "", desc: "", status: "معلق" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة طلب
          </button>
        </div>
      )}
    </div>
  );
}
