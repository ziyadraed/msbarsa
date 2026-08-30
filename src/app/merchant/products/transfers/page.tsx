"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Product = { id: string; name: string; stock: number };

const REASONS = ["إعادة تزويد", "تعديل يدوي", "إتلاف", "تحويل من فرع", "تصحيح جرد", "أخرى"];

export default function TransfersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pid, setPid] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/merchant/inventory");
        const d = await r.json();
        setProducts(d.products ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function transfer(e: React.FormEvent) {
    e.preventDefault();
    const d = Number(delta);
    if (!pid) return toast.error("اختر المنتج");
    if (!delta || isNaN(d) || d === 0) return toast.error("أدخل كمية صحيحة");
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pid, delta: d }),
      });
      const data = await r.json();
      if (!r.ok) return toast.error(data.error || "فشل التعديل");
      toast.success(d > 0 ? "تمت إضافة الكمية للمخزون" : "تم خصم الكمية من المخزون");
      setDelta("");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  const selected = products.find((p) => p.id === pid);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">نقل المخزون</h2>
        <p className="text-sm text-ink-300 mt-1">اضبط كمية منتج بربطه بسبب — ويُسجَّل كل تعديل في سجل المخزون</p>
      </div>

      {loading ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
      ) : (
        <form onSubmit={transfer} className="glass rounded-3xl p-6 space-y-4">
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">المنتج</span>
            <select className="inp" value={pid} onChange={(e) => setPid(e.target.value)}>
              <option value="">اختر المنتج...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (المخزون: {p.stock})</option>
              ))}
            </select>
          </label>

          {selected && (
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-xs">
              <p className="text-ink-300">المخزون الحالي: <span className="font-latin font-bold text-neon-400">{selected.stock}</span></p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الكمية (سالبة للخصم)</span>
              <input className="inp font-latin" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="10 أو -10" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">السبب</span>
              <select className="inp" value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
          </div>

          <button type="submit" disabled={saving || !pid} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />} تنفيذ النقل
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-xs text-ink-300 leading-7">
        <p className="font-semibold text-ink-100 mb-1">ملاحظة</p>
        كل عملية نقل تُسجَّل تلقائيًا في «سجل المخزون» مع المقدار والاتجاه، لضمان تتبع كامل لحركة المنتج.
      </div>
    </div>
  );
}
