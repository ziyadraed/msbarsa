"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, RefreshCw, X, Loader2, Save, Package } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; customFields?: Record<string, string> };
type FieldRow = { key: string; value: string };

export default function CustomFieldsPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [rows, setRows] = useState<FieldRow[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/products");
      const d = await r.json();
      setProducts((d.products ?? []).map((p: P) => ({ id: p.id, name: p.name, customFields: p.customFields ?? {} })));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function open(p: P) {
    const cf = p.customFields ?? {};
    setEditing(p.id);
    setRows(Object.keys(cf).length ? Object.entries(cf).map(([k, v]) => ({ key: k, value: v })) : [{ key: "", value: "" }]);
  }

  async function save() {
    if (!editing) return;
    const fields: Record<string, string> = {};
    for (const r of rows) {
      const k = r.key.trim();
      if (k) fields[k] = r.value.trim();
    }
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, customFields: fields }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الحفظ");
      toast.success("تم حفظ الحقول المخصصة");
      setProducts((prev) => prev.map((p) => (p.id === editing ? { ...p, customFields: fields } : p)));
      setEditing(null);
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">الحقول المخصصة للمنتجات</h2>
        <p className="text-sm text-ink-300 mt-1">أضف حقول بيانات إضافية (مواصفات، تفاصيل...) لكل منتج</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <p className="text-xs text-ink-300">المنتجات ({products.length})</p>
          <button onClick={load} className="btn-ghost rounded-xl p-2"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا منتجات بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((p) => (
              <div key={p.id}>
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-white/3">
                  <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0"><KeyRound className="w-5 h-5 text-neon-400" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-300">{Object.keys(p.customFields ?? {}).length} حقل مخصص</p>
                  </div>
                  <button onClick={() => open(p)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold shrink-0">{editing === p.id ? "إغلاق" : "تعديل"}</button>
                </div>

                {editing === p.id && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                    {rows.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input className="inp flex-1" placeholder="اسم الحقل (مثال: الإصدار)" value={r.key} onChange={(e) => setRows(rows.map((x, xi) => xi === i ? { ...x, key: e.target.value } : x))} />
                        <input className="inp flex-1" placeholder="القيمة" value={r.value} onChange={(e) => setRows(rows.map((x, xi) => xi === i ? { ...x, value: e.target.value } : x))} />
                        <button onClick={() => setRows(rows.filter((_, xi) => xi !== i))} disabled={rows.length === 1} className="btn-ghost rounded-xl p-2 text-rose-300 disabled:opacity-30"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <button onClick={() => setRows([...rows, { key: "", value: "" }])} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> إضافة حقل</button>
                      <button onClick={save} disabled={saving} className="btn-primary rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} حفظ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
