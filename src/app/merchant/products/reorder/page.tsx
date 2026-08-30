"use client";

import { useEffect, useState } from "react";
import { MoveUp, MoveDown, RefreshCw, Loader2, Save, Package } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; price: number; sort: number };

export default function ReorderPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/products");
      const d = await r.json();
      setProducts((d.products ?? []).sort((a: P, b: P) => a.sort - b.sort));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= products.length) return;
    setProducts((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      for (let i = 0; i < products.length; i++) {
        await fetch("/api/merchant/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: products[i].id, sort: i }),
        });
      }
      toast.success("تم حفظ ترتيب المنتجات");
    } catch {
      toast.error("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">ترتيب المنتجات</h2>
          <p className="text-sm text-ink-300 mt-1">اضبط ترتيب ظهور منتجاتك في المتجر — {products.length} منتج</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الترتيب
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا منتجات بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((p, i) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                <span className="font-latin text-xs text-ink-300 w-6">{i + 1}</span>
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 shrink-0"><Package className="w-4 h-4 text-neon-400" /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost rounded-lg p-2 disabled:opacity-30"><MoveUp className="w-4 h-4" /></button>
                  <button onClick={() => move(i, 1)} disabled={i === products.length - 1} className="btn-ghost rounded-lg p-2 disabled:opacity-30"><MoveDown className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
