"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2, Save, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; stock: number; customFields?: Record<string, string> };

export default function ReorderPointPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [levels, setLevels] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/products");
      const d = await r.json();
      const list = (d.products ?? []).map((p: P) => ({ id: p.id, name: p.name, stock: p.stock, customFields: p.customFields ?? {} }));
      setProducts(list);
      setLevels(Object.fromEntries(list.map((p: P) => [p.id, String(p.customFields?.reorderLevel ?? "")])));
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
        const lvl = levels[p.id]?.trim();
        const cf = { ...(p.customFields ?? {}) };
        if (lvl) cf.reorderLevel = lvl;
        else delete cf.reorderLevel;
        await fetch("/api/merchant/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: p.id, customFields: cf }),
        });
      }
      toast.success("تم حفظ حدود إعادة الطلب");
    } catch {
      toast.error("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  }

  const belowReorder = products.filter((p) => {
    const lvl = Number(levels[p.id]);
    return lvl > 0 && p.stock <= lvl;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">حد إعادة الطلب</h2>
          <p className="text-sm text-ink-300 mt-1">حدد حدًا أدنى لكل منتج ينبّهك للطلب مجددًا — {belowReorder} منتج دون الحد</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      </div>

      {belowReorder > 0 && (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/5 p-5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-200"><b>{belowReorder} منتج</b> وصل إلى حد إعادة الطلب أو دونه — يحتاج إعادة تزويد.</p>
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا منتجات بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((p) => {
              const lvl = Number(levels[p.id] ?? 0);
              const low = lvl > 0 && p.stock <= lvl;
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 shrink-0"><Package className="w-4 h-4 text-neon-400" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-300">المخزون الحالي: <span className={`font-latin ${low ? "text-amber-400" : "text-emerald-400"}`}>{p.stock}</span></p>
                  </div>
                  <input className="inp !w-24 !py-2 font-latin text-center" type="number" min="0" placeholder="بلا حد" value={levels[p.id] ?? ""} onChange={(e) => setLevels((l) => ({ ...l, [p.id]: e.target.value }))} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
