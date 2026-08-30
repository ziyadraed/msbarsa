"use client";

import { useEffect, useState } from "react";
import { Tags, Plus, X, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Product = { id: string; name: string; price: number; tags: string[] };

const PRESET = ["مميز", "جديد", "الأكثر مبيعًا", "عرض محدود", "ترخيص رسمي"];

export default function ProductTagsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/products");
      const d = await r.json();
      setProducts((d.products ?? []).map((p: Product) => ({ id: p.id, name: p.name, price: p.price, tags: p.tags ?? [] })));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));
  const visible = filter ? products.filter((p) => p.tags.includes(filter)) : products;

  async function toggleTag(pid: string, tag: string) {
    const prod = products.find((p) => p.id === pid);
    if (!prod) return;
    const next = prod.tags.includes(tag) ? prod.tags.filter((t) => t !== tag) : [...prod.tags, tag];
    const r = await fetch("/api/merchant/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pid, tags: next }),
    });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "فشل الحفظ");
    setProducts((prev) => prev.map((p) => (p.id === pid ? { ...p, tags: next } : p)));
    toast.success("تم تحديث الوسوم");
  }

  async function addCustom(pid: string) {
    const t = custom.trim();
    if (!t) return;
    await toggleTag(pid, t);
    setCustom("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">وسوم المنتجات</h2>
          <p className="text-sm text-ink-300 mt-1">صنّف منتجاتك بوسوم لتسهيل التصفية والعروض — {products.length} منتج</p>
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`rounded-2xl px-4 py-2 text-xs font-semibold ${!filter ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}>
          الكل ({products.length})
        </button>
        {allTags.map((t) => (
          <button key={t} onClick={() => setFilter(filter === t ? "" : t)} className={`rounded-2xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 ${filter === t ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}>
            <Tags className="w-3.5 h-3.5" /> {t} ({products.filter((p) => p.tags.includes(t)).length})
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا منتجات في هذا الفلتر</div>
        ) : (
          <div className="divide-y divide-white/5">
            {visible.map((p) => (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="font-latin text-xs text-ink-300">{p.price} ر.س</p>
                  </div>
                  <button onClick={() => setEditing(editing === p.id ? null : p.id)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold shrink-0">
                    {editing === p.id ? "إغلاق" : "تعديل الوسوم"}
                  </button>
                </div>

                {editing === p.id ? (
                  <div className="mt-3 border-t border-white/8 pt-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {PRESET.map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleTag(p.id, t)}
                          className={`text-[11px] px-3 py-1.5 rounded-full border ${p.tags.includes(t) ? "bg-neon-400/20 text-neon-400 border-neon-400/50" : "bg-white/5 text-ink-300 border-white/10"}`}
                        >
                          {t}
                        </button>
                      ))}
                      {p.tags.filter((t) => !PRESET.includes(t)).map((t) => (
                        <button key={t} onClick={() => toggleTag(p.id, t)} className="text-[11px] px-3 py-1.5 rounded-full border bg-neon-400/20 text-neon-400 border-neon-400/50 flex items-center gap-1">
                          {t} <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input className="inp !py-2 flex-1" placeholder="وسم مخصص..." value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom(p.id)} />
                      <button onClick={() => addCustom(p.id)} className="btn-ghost rounded-xl px-3 text-xs font-semibold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> إضافة</button>
                    </div>
                  </div>
                ) : (
                  p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-neon-400/10 text-neon-400 border border-neon-400/20 flex items-center gap-1">
                          <Tags className="w-3 h-3" /> {t}
                        </span>
                      ))}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
