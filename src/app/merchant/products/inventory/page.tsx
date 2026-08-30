"use client";

import { useEffect, useState } from "react";
import { Boxes, RefreshCw, AlertTriangle, Minus, Plus, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

type InvItem = {
  id: string;
  name: string;
  latinName: string;
  sku: string;
  stock: number;
  cost: number;
  price: number;
  status: string;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [lowCount, setLowCount] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [onlyLow, setOnlyLow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [adjust, setAdjust] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/merchant/inventory${onlyLow ? "?low=1" : ""}`);
      const d = await r.json();
      setItems(d.products ?? []);
      setLowCount(d.lowCount ?? 0);
      setThreshold(d.threshold ?? 10);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [onlyLow]);

  async function applyAdjust(id: string, delta: number) {
    setBusy(id);
    try {
      const r = await fetch("/api/merchant/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, delta }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل التعديل");
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, stock: d.product.stock } : it)));
      toast.success("تم تحديث المخزون");
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setBusy(null);
    }
  }

  async function applySet(id: string) {
    const val = Number(adjust[id]);
    if (!adjust[id] || isNaN(val) || val < 0) return toast.error("أدخل كمية صحيحة");
    setBusy(id);
    try {
      const r = await fetch("/api/merchant/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, set: val }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل التعديل");
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, stock: d.product.stock } : it)));
      setAdjust((a) => ({ ...a, [id]: "" }));
      toast.success("تم ضبط الكمية");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة المخزون</h2>
          <p className="text-sm text-ink-300 mt-1">تابع الكميات واضبطها لكل منتج — {items.length} صنف</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyLow((v) => !v)}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors ${
              onlyLow ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "btn-ghost"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> المخزون المنخفض ({lowCount})
          </button>
          <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {lowCount > 0 && !onlyLow && (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/5 p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-amber-200">تنبيه: {lowCount} منتج وصل إلى مخزون منخفض</p>
            <p className="text-ink-300 mt-1">المنتجات التي بمخزون {threshold} أو أقل تحتاج إعادة تزويد — اضغط «المخزون المنخفض» لعرضها.</p>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا أصناف — أضف منتجات أولًا من قسم المنتجات</div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((it) => {
              const low = it.stock <= threshold;
              return (
                <div key={it.id} className="px-5 py-4 flex flex-wrap items-center gap-4 hover:bg-white/3">
                  <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0">
                    <Package className="w-5 h-5 text-neon-400" />
                  </span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-sm font-semibold truncate">{it.name}</p>
                    <p className="text-[11px] text-ink-300 truncate font-latin">{it.sku || it.latinName}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => applyAdjust(it.id, -1)}
                      disabled={busy === it.id || it.stock <= 0}
                      className="btn-ghost rounded-xl w-8 h-8 grid place-items-center disabled:opacity-40"
                      aria-label="إنقاص"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div
                      className={`w-20 text-center text-lg font-bold font-latin ${
                        it.stock === 0 ? "text-red-400" : low ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {busy === it.id ? <Loader2 className="w-5 h-5 animate-spin inline" /> : it.stock}
                    </div>
                    <button
                      onClick={() => applyAdjust(it.id, 1)}
                      disabled={busy === it.id}
                      className="btn-ghost rounded-xl w-8 h-8 grid place-items-center disabled:opacity-40"
                      aria-label="زيادة"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      className="inp !w-20 !py-2 text-center font-latin"
                      placeholder="ضبط"
                      value={adjust[it.id] ?? ""}
                      onChange={(e) => setAdjust((a) => ({ ...a, [it.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && applySet(it.id)}
                    />
                    <button
                      onClick={() => applySet(it.id)}
                      disabled={busy === it.id}
                      className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-40"
                    >
                      ضبط
                    </button>
                  </div>

                  {low && (
                    <span className="hidden sm:inline text-[11px] px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0">
                      منخفض
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
