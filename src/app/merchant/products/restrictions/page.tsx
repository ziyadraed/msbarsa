"use client";

import { useEffect, useState } from "react";
import { Lock, RefreshCw, Loader2, Save, Package } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; minQty: number; maxQty: number | null };
type R = Record<string, { min: string; max: string }>;

export default function RestrictionsPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<R>({});

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/products");
      const d = await r.json();
      const list = (d.products ?? []).map((p: P) => ({ id: p.id, name: p.name, minQty: p.minQty ?? 1, maxQty: p.maxQty ?? null }));
      setProducts(list);
      setRows(Object.fromEntries(list.map((p: P) => [p.id, { min: String(p.minQty), max: p.maxQty ? String(p.maxQty) : "" }])));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    try {
      for (const p of products) {
        const r = rows[p.id];
        await fetch("/api/merchant/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: p.id, minQty: Number(r.min) || 1, maxQty: r.max ? Number(r.max) : null }),
        });
      }
      toast.success("تم حفظ قيود المنتجات");
    } catch {
      toast.error("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">قيود المنتجات</h2>
          <p className="text-sm text-ink-300 mt-1">تحكم بالحد الأدنى والأقصى للكمية لكل منتج</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الكل
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا منتجات بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            <div className="px-5 py-3 flex items-center gap-4 text-xs text-ink-300 bg-white/2">
              <span className="flex-1">المنتج</span>
              <span className="w-24">الحد الأدنى</span>
              <span className="w-24">الحد الأقصى</span>
            </div>
            {products.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 shrink-0"><Lock className="w-4 h-4 text-neon-400" /></span>
                <span className="flex-1 text-sm font-semibold truncate flex items-center gap-2"><Package className="w-4 h-4 text-ink-300" /> {p.name}</span>
                <input className="inp !w-24 !py-2 font-latin text-center" type="number" min="0" value={rows[p.id]?.min ?? "1"} onChange={(e) => setRows((r) => ({ ...r, [p.id]: { ...r[p.id], min: e.target.value } }))} />
                <input className="inp !w-24 !py-2 font-latin text-center" type="number" min="0" placeholder="∞" value={rows[p.id]?.max ?? ""} onChange={(e) => setRows((r) => ({ ...r, [p.id]: { ...r[p.id], max: e.target.value } }))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
