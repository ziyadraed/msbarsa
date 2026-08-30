"use client";

import { useEffect, useState } from "react";
import { Ruler, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; size: string; chest: string; waist: string; hip: string };

export default function SizeChartPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Row[]>([{ id: "1", size: "S", chest: "88-92", waist: "72-76", hip: "90-94" }]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.sizeChart) && (s.sizeChart as Row[]).length) setRows(s.sizeChart as Row[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { sizeChart: rows } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ جدول المقاسات");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">جدول مقاسات المنتجات</h2><p className="text-sm text-ink-300 mt-1">أنشئ جدول مقاسات يظهر لعملائك على صفحات المنتجات</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Ruler className="w-5 h-5 text-emerald-400" /></span>
              <p className="font-bold text-sm">جدول المقاسات</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-ink-300 text-[11px]">
                  <th className="text-right py-2">المقاس</th><th className="text-right py-2">الصدر (سم)</th><th className="text-right py-2">الخصر (سم)</th><th className="text-right py-2">الأرداف (سم)</th><th />
                </tr>
              </thead>
              <tbody className="space-y-1">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-1 pe-1"><input className={inp} value={r.size} onChange={(e) => setRows((p) => p.map((x) => x.id === r.id ? { ...x, size: e.target.value } : x))} /></td>
                    <td className="py-1 px-1"><input className={inp} value={r.chest} onChange={(e) => setRows((p) => p.map((x) => x.id === r.id ? { ...x, chest: e.target.value } : x))} /></td>
                    <td className="py-1 px-1"><input className={inp} value={r.waist} onChange={(e) => setRows((p) => p.map((x) => x.id === r.id ? { ...x, waist: e.target.value } : x))} /></td>
                    <td className="py-1 px-1"><input className={inp} value={r.hip} onChange={(e) => setRows((p) => p.map((x) => x.id === r.id ? { ...x, hip: e.target.value } : x))} /></td>
                    <td className="py-1"><button type="button" onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setRows((p) => [...p, { id: crypto.randomUUID(), size: "", chest: "", waist: "", hip: "" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة مقاس
          </button>
        </div>
      )}
    </div>
  );
}
