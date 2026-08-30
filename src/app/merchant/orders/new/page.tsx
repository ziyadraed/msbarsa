"use client";

import { useState } from "react";
import { Plus, X, Save, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({ customerName: "", email: "", phone: "" });
  const [lines, setLines] = useState<{ name: string; price: string; qty: string }[]>([{ name: "", price: "", qty: "1" }]);
  const [saving, setSaving] = useState(false);

  const subtotal = lines.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 1), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const validLines = lines.filter((l) => l.name.trim() && Number(l.price) > 0);
      const r = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          lines: validLines.map((l) => ({ name: l.name.trim(), price: Number(l.price), qty: Number(l.qty) || 1 })),
        }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل إنشاء الطلب");
      toast.success(`تم إنشاء الطلب #${d.orderNumber}`);
      router.push("/merchant/orders");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">إنشاء طلب يدوي</h2>
        <p className="text-sm text-ink-300 mt-1">سجّل طلبًا للعميل عبر الهاتف أو بشكل يدوي</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-neon-400" /> بيانات العميل</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">اسم العميل *</span>
              <input className="inp" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">البريد الإلكتروني *</span>
              <input className="inp" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-xs text-ink-300 mb-1.5">الجوال</span>
              <input className="inp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">المنتجات</h3>
            <button type="button" onClick={() => setLines([...lines, { name: "", price: "", qty: "1" }])} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> إضافة منتج
            </button>
          </div>
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="inp flex-1" placeholder="اسم المنتج" value={l.name} onChange={(e) => setLines(lines.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))} />
              <input className="inp !w-24 font-latin" type="number" placeholder="السعر" value={l.price} onChange={(e) => setLines(lines.map((x, xi) => xi === i ? { ...x, price: e.target.value } : x))} />
              <input className="inp !w-16 font-latin" type="number" placeholder="كمية" value={l.qty} onChange={(e) => setLines(lines.map((x, xi) => xi === i ? { ...x, qty: e.target.value } : x))} />
              <button type="button" onClick={() => setLines(lines.filter((_, xi) => xi !== i))} disabled={lines.length === 1} className="btn-ghost rounded-xl p-2.5 text-rose-300 disabled:opacity-30">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-white/8 text-sm">
            <span className="text-ink-300">الإجمالي</span>
            <span className="font-latin font-bold text-neon-400">{subtotal} ر.س</span>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3.5 text-sm font-bold flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} إنشاء الطلب
        </button>
      </form>
    </div>
  );
}
