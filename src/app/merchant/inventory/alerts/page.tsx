"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2 } from "lucide-react";

type P = { id: string; name: string; stock: number; customFields: Record<string, unknown> };

export default function AlertsPage() {
  const [loaded, setLoaded] = useState(false);
  const [low, setLow] = useState<P[]>([]);
  const [out, setOut] = useState<P[]>([]);

  useEffect(() => {
    fetch("/api/merchant/products?limit=500").then((r) => r.json()).then((d) => {
      const prods = (Array.isArray(d.products) ? d.products : []) as P[];
      setLow(prods.filter((p) => {
        const lvl = Number(p.customFields?.reorderLevel ?? 5);
        return p.stock > 0 && p.stock <= lvl;
      }));
      setOut(prods.filter((p) => p.stock <= 0));
    }).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تنبيهات نفاد المخزون</h2><p className="text-sm text-ink-300 mt-1">راقب المنتجات القريبة من النفاد</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-red-400/15 text-red-400"><BellRing className="w-5 h-5" /></span>
              <p className="font-bold text-sm">نافد (0)</p>
              <span className="text-2xl font-black ms-auto">{out.length}</span>
            </div>
            <div className="space-y-2">
              {out.length === 0 && <p className="text-xs text-ink-300/60 text-center py-3">لا منتجات نافدة</p>}
              {out.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-red-400/20 bg-red-400/5 p-3">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-sm font-bold text-red-400">نافد</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-amber-400/15 text-amber-400"><BellRing className="w-5 h-5" /></span>
              <p className="font-bold text-sm">منخفض (تحت حد إعادة الطلب)</p>
              <span className="text-2xl font-black ms-auto">{low.length}</span>
            </div>
            <div className="space-y-2">
              {low.length === 0 && <p className="text-xs text-ink-300/60 text-center py-3">لا منتجات منخفضة</p>}
              {low.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-sm font-bold text-amber-400">{p.stock} متبقٍ</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
