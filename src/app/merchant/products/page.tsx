"use client";

import { useEffect, useState } from "react";
import { Plus, Package, RefreshCw, Loader2, Search, Save, X, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  latinName: string;
  categorySlug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  status: string;
  slug: string;
  type: string;
  shortDesc?: string;
  sku?: string;
  barcode?: string;
  cost?: number;
};
type Cat = { slug: string; name: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [eForm, setEForm] = useState({
    name: "", latinName: "", categorySlug: "windows", price: "", stock: "0", type: "physical",
    comparePrice: "", sku: "", barcode: "", cost: "", shortDesc: "", status: "active",
  });
  const [form, setForm] = useState({
    name: "", latinName: "", categorySlug: "windows", price: "", stock: "0", type: "physical",
  });

  function openEdit(p: Product) {
    setEditing(p);
    setEForm({
      name: p.name,
      latinName: p.latinName,
      categorySlug: p.categorySlug,
      price: String(p.price),
      stock: String(p.stock),
      type: p.type,
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      sku: p.sku ?? "",
      barcode: p.barcode ?? "",
      cost: p.cost ? String(p.cost) : "",
      shortDesc: p.shortDesc ?? "",
      status: p.status,
    });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          name: eForm.name,
          latinName: eForm.latinName,
          categorySlug: eForm.categorySlug,
          price: Number(eForm.price),
          comparePrice: eForm.comparePrice ? Number(eForm.comparePrice) : null,
          stock: Number(eForm.stock),
          type: eForm.type,
          sku: eForm.sku,
          barcode: eForm.barcode,
          cost: eForm.cost ? Number(eForm.cost) : 0,
          shortDesc: eForm.shortDesc,
          status: eForm.status,
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الحفظ");
      toast.success("تم تحديث المنتج");
      setEditing(null);
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/merchant/products?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setProducts(d.products ?? []);
      setCats(d.categories ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeProduct(id: string, name: string) {
    if (!confirm(`حذف المنتج «${name}» نهائيًا؟`)) return;
    const r = await fetch(`/api/merchant/products?id=${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "فشل الحذف");
    toast.success("تم حذف المنتج");
    load();
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم إضافة المنتج");
      setShowForm(false);
      setForm({ name: "", latinName: "", categorySlug: cats[0]?.slug || "windows", price: "", stock: "0", type: "physical" });
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">المنتجات</h2>
          <p className="text-sm text-ink-300 mt-1">أدر منتجات متجرك — {products.length} منتج</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة منتج
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProduct} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-neon-400" /> منتج جديد</h3>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">اسم المنتج *</span>
              <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="مثال: ويندوز 11 برو" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الاسم اللاتيني</span>
              <input className="inp" value={form.latinName} onChange={(e) => setForm({ ...form, latinName: e.target.value })} placeholder="Windows 11 Pro" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">القسم</span>
              <select className="inp" value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}>
                {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">النوع</span>
              <select className="inp" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="physical">منتج مادي</option>
                <option value="digital">منتج رقمي</option>
                <option value="service">خدمة</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">السعر (ر.س) *</span>
              <input className="inp" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="1" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">المخزون</span>
              <input className="inp" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ المنتج
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-2xl px-6 py-3 text-sm font-semibold">إلغاء</button>
          </div>
        </form>
      )}

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="glass rounded-3xl p-6 space-y-4 ring-1 ring-neon-400/20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2"><Pencil className="w-5 h-5 text-neon-400" /> تعديل: {editing.name}</h3>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">اسم المنتج *</span>
              <input className="inp" value={eForm.name} onChange={(e) => setEForm({ ...eForm, name: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الاسم اللاتيني</span>
              <input className="inp" value={eForm.latinName} onChange={(e) => setEForm({ ...eForm, latinName: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">القسم</span>
              <select className="inp" value={eForm.categorySlug} onChange={(e) => setEForm({ ...eForm, categorySlug: e.target.value })}>
                {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">السعر (ر.س) *</span>
              <input className="inp" type="number" value={eForm.price} onChange={(e) => setEForm({ ...eForm, price: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">السعر قبل الخصم</span>
              <input className="inp" type="number" value={eForm.comparePrice} onChange={(e) => setEForm({ ...eForm, comparePrice: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">التكلفة</span>
              <input className="inp" type="number" value={eForm.cost} onChange={(e) => setEForm({ ...eForm, cost: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">المخزون</span>
              <input className="inp" type="number" value={eForm.stock} onChange={(e) => setEForm({ ...eForm, stock: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">النوع</span>
              <select className="inp" value={eForm.type} onChange={(e) => setEForm({ ...eForm, type: e.target.value })}>
                <option value="physical">منتج مادي</option>
                <option value="digital">منتج رقمي</option>
                <option value="service">خدمة</option>
                <option value="preorder">طلب مسبق</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الحالة</span>
              <select className="inp" value={eForm.status} onChange={(e) => setEForm({ ...eForm, status: e.target.value })}>
                <option value="active">نشط</option>
                <option value="draft">مسودة</option>
                <option value="archived">مؤرشف</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">SKU</span>
              <input className="inp font-latin" value={eForm.sku} onChange={(e) => setEForm({ ...eForm, sku: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">Barcode</span>
              <input className="inp font-latin" value={eForm.barcode} onChange={(e) => setEForm({ ...eForm, barcode: e.target.value })} />
            </label>
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="block text-xs text-ink-300 mb-1.5">وصف مختصر</span>
              <textarea className="inp" rows={2} value={eForm.shortDesc} onChange={(e) => setEForm({ ...eForm, shortDesc: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التعديل
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost rounded-2xl px-6 py-3 text-sm font-semibold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input className="inp pl-3 pr-10" placeholder="ابحث بالاسم..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl px-4 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا منتجات بعد — أضف أول منتج</div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/3">
                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0">
                  <Package className="w-5 h-5 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-300 truncate">{p.latinName || p.slug}</p>
                </div>
                <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">{p.type}</span>
                <div className="text-left shrink-0">
                  <p className="font-latin font-bold text-sm">{p.price} ر.س</p>
                  <p className="text-[11px] text-ink-300">مخزون: {p.stock}</p>
                </div>
                <button onClick={() => openEdit(p)} className="btn-ghost rounded-xl p-2 text-ink-200 hover:text-neon-400 shrink-0"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => removeProduct(p.id, p.name)} className="btn-ghost rounded-xl p-2 text-rose-300 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
