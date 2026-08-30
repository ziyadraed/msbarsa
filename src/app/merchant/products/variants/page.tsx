"use client";

import { useEffect, useState } from "react";
import { Boxes, ChevronDown, Plus, X, Save, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Product = { id: string; name: string; price: number };
type Variant = { id: string; name: string; sku: string; price: number; cost: number; stock: number; options: Record<string, string> };

export default function VariantsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Record<string, Variant[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: "", cost: "", stock: "0", optionName: "", optionValue: "" });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/products");
      const d = await r.json();
      setProducts((d.products ?? []).map((p: Product) => ({ id: p.id, name: p.name, price: p.price })));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function loadVariants(pid: string) {
    const r = await fetch(`/api/merchant/products/variants?productId=${pid}`);
    const d = await r.json();
    setVariants((v) => ({ ...v, [pid]: d.variants ?? [] }));
  }

  function toggle(pid: string) {
    const next = expanded === pid ? null : pid;
    setExpanded(next);
    if (next) loadVariants(pid);
  }

  async function addVariant(pid: string, e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/products/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: pid,
          name: form.name,
          sku: form.sku,
          price: Number(form.price),
          cost: form.cost ? Number(form.cost) : 0,
          stock: Number(form.stock),
          options: form.optionName ? { [form.optionName]: form.optionValue } : {},
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الإضافة");
      toast.success("تمت إضافة المتغير");
      setForm({ name: "", sku: "", price: "", cost: "", stock: "0", optionName: "", optionValue: "" });
      setShowForm((s) => ({ ...s, [pid]: false }));
      loadVariants(pid);
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  async function removeVariant(pid: string, id: string) {
    if (!confirm("حذف هذا المتغير؟")) return;
    const r = await fetch(`/api/merchant/products/variants?id=${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("تم الحذف");
      loadVariants(pid);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">خيارات المنتج (المتغيرات)</h2>
        <p className="text-sm text-ink-300 mt-1">أضف متغيرات (لون/حجم/سعة...) لكل منتج بسعر ومخزون مستقل</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا منتجات بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((p) => {
              const vars = variants[p.id] ?? [];
              return (
                <div key={p.id}>
                  <div className="px-5 py-4 flex items-center gap-4 hover:bg-white/3">
                    <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0"><Boxes className="w-5 h-5 text-neon-400" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      <p className="text-[11px] text-ink-300">{vars.length} متغير</p>
                    </div>
                    <p className="font-latin font-bold text-sm">{p.price} ر.س</p>
                    <button onClick={() => toggle(p.id)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1">
                      {expanded === p.id ? "إخفاء" : "إدارة"} <ChevronDown className={`w-4 h-4 transition-transform ${expanded === p.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {expanded === p.id && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-ink-300 font-semibold">متغيرات هذا المنتج</p>
                        <button onClick={() => setShowForm((s) => ({ ...s, [p.id]: !s[p.id] }))} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> إضافة متغير
                        </button>
                      </div>

                      {showForm[p.id] && (
                        <form onSubmit={(e) => addVariant(p.id, e)} className="rounded-2xl bg-white/4 p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <input className="inp" placeholder="الاسم (مثال: أسود)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                          <input className="inp font-latin" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                          <input className="inp font-latin" type="number" placeholder="السعر *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                          <input className="inp font-latin" type="number" placeholder="التكلفة" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                          <input className="inp font-latin" type="number" placeholder="المخزون" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                          <div className="flex gap-2">
                            <input className="inp" placeholder="خيار (لون)" value={form.optionName} onChange={(e) => setForm({ ...form, optionName: e.target.value })} />
                            <input className="inp" placeholder="القيمة" value={form.optionValue} onChange={(e) => setForm({ ...form, optionValue: e.target.value })} />
                          </div>
                          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 col-span-full">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ المتغير
                          </button>
                        </form>
                      )}

                      {vars.length === 0 ? (
                        <p className="text-sm text-ink-300 py-3 text-center">لا متغيرات بعد</p>
                      ) : (
                        <div className="space-y-2">
                          {vars.map((v) => (
                            <div key={v.id} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-2.5">
                              <span className="w-4 h-4 rounded-full border border-neon-400/40" />
                              <span className="flex-1 text-sm">{v.name}</span>
                              {v.sku && <span className="font-latin text-[11px] text-ink-300">{v.sku}</span>}
                              <span className="font-latin text-xs text-ink-300">مخزون {v.stock}</span>
                              <span className="font-latin font-bold text-sm">{v.price} ر.س</span>
                              <button onClick={() => removeVariant(p.id, v.id)} className="btn-ghost rounded-lg p-1.5 text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
