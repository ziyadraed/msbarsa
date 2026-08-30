"use client";

import { useEffect, useState } from "react";
import { Scale, Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; stock: number };

export default function AdjustmentPage() {
  const [loaded, setLoaded] = useState(false);
  const [prods, setProds] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [adj, setAdj] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/products?limit=300").then((r) => r.json()).then((d) => {
      setProds(Array.isArray(d.products) ? d.products : []);
    }).finally(() => setLoaded(true));
  }, []);

  const filtered = prods.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  async function save() {
    setSaving(true);
    let ok = 0;
    try {
      for (const id of Object.keys(adj)) {
        const p = prods.find((x) => x.id === id)!;
        const newStock = Math.max(0, p.stock + (adj[id] || 0));
        const res = await fetch("/api/merchant/products", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, stock: newStock }),
        });
        if (res.ok) ok++;
      }
      toast.success(`تم تسوية ${ok} منتج${reason ? ` · السبب: ${reason}` : ""}`);
      setAdj({});
      const d = await fetch("/api/merchant/products?limit=300").then((r) => r.json());
      setProds(Array.isArray(d.products) ? d.products : []);
    } finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تسوية المخزون</h2><p className="text-sm text-ink-300 mt-1">اضبط المخزون الفعلي بعد الجرد (±)</p></div>

      <div className="glass rounded-3xl p-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-ink-300" />
        <input className="flex-1 bg-transparent outline-none text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." />
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><Scale className="w-5 h-5 text-sky-400" /></span>
            <div className="flex-1">
              <p className="font-bold text-sm">{Object.keys(adj).length} تسوية معلّقة</p>
              <input className={inp + " mt-2"} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="سبب التسوية (اختياري)" />
            </div>
            <button onClick={save} disabled={saving || Object.keys(adj).length === 0} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {filtered.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا منتجات</p>}
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <p className="flex-1 text-sm font-semibold truncate">{p.name}</p>
                <span className="text-xs text-ink-300">حالي: <b className="text-ink-100">{p.stock}</b></span>
                <input type="number" className="w-24 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none text-center" value={adj[p.id] ?? 0} onChange={(e) => setAdj({ ...adj, [p.id]: Number(e.target.value) })} placeholder="±" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
