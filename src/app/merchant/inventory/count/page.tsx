"use client";

import { useEffect, useState } from "react";
import { ClipboardList, RefreshCw, Loader2, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; stock: number };

export default function InventoryCountPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ matched: number; adjusted: number } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/inventory");
      const d = await r.json();
      const list = (d.products ?? []).map((p: P) => ({ id: p.id, name: p.name, stock: p.stock }));
      setProducts(list);
      setCounts(Object.fromEntries(list.map((p: P) => [p.id, String(p.stock)])));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setSubmitting(true);
    setResult(null);
    let matched = 0, adjusted = 0;
    try {
      for (const p of products) {
        const counted = Number(counts[p.id]);
        if (isNaN(counted) || counted === p.stock) { matched++; continue; }
        const r = await fetch("/api/merchant/inventory", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: p.id, set: counted }),
        });
        if (r.ok) adjusted++;
      }
      setResult({ matched, adjusted });
      toast.success(`الجرد اكتمل: تطابق ${matched}، تسوية ${adjusted}`);
    } catch {
      toast.error("خطأ في الجرد");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">جرد المخزون</h2>
          <p className="text-sm text-ink-300 mt-1">سجّل العد الفعلي لكل منتج وطبّق التسوية — {products.length} منتج</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={submit} disabled={submitting} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />} إنهاء الجرد
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/5 p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-200">اكتمل الجرد: <b>{result.matched}</b> منتج مطابق، <b>{result.adjusted}</b> منتج تمت تسويته (سُجّلت في سجل المخزون).</p>
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
              const diff = (Number(counts[p.id] ?? p.stock) || 0) - p.stock;
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 shrink-0"><Package className="w-4 h-4 text-neon-400" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
<p className="text-[11px] text-ink-300">المسجل: <span className="font-latin">{p.stock}</span>{diff !== 0 && <span className={"font-latin " + (diff > 0 ? "text-emerald-400" : "text-rose-400")}> · فرق {diff > 0 ? "+" : ""}{diff}</span>}</p>
                  </div>
                  <input className="inp !w-24 !py-2 font-latin text-center" type="number" min="0" value={counts[p.id] ?? ""} onChange={(e) => setCounts((c) => ({ ...c, [p.id]: e.target.value }))} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
