"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; price: number; stock: number; status: string };

export default function DeletedProductsPage() {
  const [loaded, setLoaded] = useState(false);
  const [deleted, setDeleted] = useState<P[]>([]);
  const [acting, setActing] = useState(false);

  async function load() {
    const d = await fetch("/api/merchant/products?limit=200").then((r) => r.json());
    setDeleted((Array.isArray(d.products) ? d.products : []).filter((p: P) => p.status !== "active"));
  }

  useEffect(() => { load().finally(() => setLoaded(true)); }, []);

  async function restore(p: P) {
    setActing(true);
    try {
      const r = await fetch("/api/merchant/products", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, status: "active" }),
      });
      if (r.ok) { toast.success("تمت الاستعادة"); setDeleted((x) => x.filter((y) => y.id !== p.id)); }
      else toast.error("تعذر الاستعادة");
    } finally { setActing(false); }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">حذف واستعادة المنتجات</h2><p className="text-sm text-ink-300 mt-1">استرجع منتجات محذوفة أو معطّلة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-2">
          {deleted.length === 0 && <p className="text-xs text-ink-300/60 text-center py-6">لا توجد منتجات محذوفة أو معطّلة</p>}
          {deleted.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-red-400/10 text-red-400"><Trash2 className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-[11px] text-ink-300">{p.price.toLocaleString()} ر.س · {p.status}</p>
              </div>
              <button onClick={() => restore(p)} disabled={acting} className="btn-primary rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> استعادة
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
