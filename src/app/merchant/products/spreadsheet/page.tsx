"use client";

import { useEffect, useState } from "react";
import { Table, Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; price: number; stock: number; categorySlug: string; status: string };

export default function SpreadsheetPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<P[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/merchant/products?limit=100").then((r) => r.json()).then((d) => {
      setRows(Array.isArray(d.products) ? d.products : []);
    }).finally(() => setLoaded(true));
  }, []);

  const filtered = rows.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  function upd(id: string, k: keyof P, v: any) {
    setRows((p) => p.map((x) => x.id === id ? { ...x, [k]: v } : x));
    setDirty((p) => new Set(p).add(id));
  }

  async function saveAll() {
    setSaving(true);
    let ok = 0;
    try {
      for (const id of dirty) {
        const r = rows.find((x) => x.id === id)!;
        const res = await fetch("/api/merchant/products", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, price: Number(r.price), stock: Number(r.stock), name: r.name }),
        });
        if (res.ok) ok++;
      }
      toast.success(`تم حفظ ${ok} تعديل`);
      setDirty(new Set());
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-2 py-1.5 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h2 className="text-2xl font-bold">محرر المنتجات الجدولي</h2><p className="text-sm text-ink-300 mt-1">عدّل المنتجات بسرعة في جدول شبيه بجداول البيانات</p></div>

      <div className="glass rounded-3xl p-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-ink-300" />
        <input className="flex-1 bg-transparent outline-none text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في المنتجات..." />
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-neon-400" />
              <p className="text-sm font-bold">{filtered.length} منتج</p>
              {dirty.size > 0 && <span className="text-[11px] text-amber-400">{dirty.size} تعديل غير محفوظ</span>}
            </div>
            <button onClick={saveAll} disabled={saving || dirty.size === 0} className="btn-primary rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} حفظ التعديلات
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-ink-300 text-[11px] border-b border-white/10">
                <th className="text-right py-2">المنتج</th><th className="text-right py-2">السعر</th><th className="text-right py-2">المخزون</th><th className="text-right py-2">التصنيف</th><th className="text-right py-2">الحالة</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-ink-300/60 py-6">لا توجد منتجات</td></tr>}
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="py-1 pe-2"><input className={inp} value={p.name} onChange={(e) => upd(p.id, "name", e.target.value)} /></td>
                    <td className="py-1 px-1 w-28"><input type="number" className={inp} value={p.price} onChange={(e) => upd(p.id, "price", Number(e.target.value))} /></td>
                    <td className="py-1 px-1 w-24"><input type="number" className={inp} value={p.stock} onChange={(e) => upd(p.id, "stock", Number(e.target.value))} /></td>
                    <td className="py-1 px-1"><span className="text-xs text-ink-300">{p.categorySlug}</span></td>
                    <td className="py-1"><span className={`text-[10px] px-2 py-1 rounded-full ${p.status === "active" ? "bg-emerald-400/10 text-emerald-400" : "bg-white/10 text-ink-300"}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
