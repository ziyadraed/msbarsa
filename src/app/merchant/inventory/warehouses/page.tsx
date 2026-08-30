"use client";

import { useEffect, useState } from "react";
import { Warehouse, Plus, Trash2, Loader2, Save, MapPin } from "lucide-react";
import { toast } from "sonner";

type WH = { id: string; name: string; location: string; manager: string };

export default function WarehousesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<WH[]>([]);
  const [form, setForm] = useState({ name: "", location: "", manager: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.warehouses)) setWarehouses(s.warehouses as WH[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function persist(next: WH[]) {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { warehouses: next } }),
      });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "تعذر الحفظ"); return false; }
      return true;
    } catch {
      toast.error("خطأ في الاتصال");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("اسم المستودع مطلوب");
    const w: WH = { id: Date.now().toString(36), name: form.name.trim(), location: form.location.trim(), manager: form.manager.trim() };
    const next = [...warehouses, w];
    const ok = await persist(next);
    if (ok) { setWarehouses(next); setForm({ name: "", location: "", manager: "" }); toast.success("تمت إضافة المستودع"); }
  }

  async function remove(id: string) {
    const next = warehouses.filter((w) => w.id !== id);
    const ok = await persist(next);
    if (ok) { setWarehouses(next); toast.success("تم الحذف"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">المستودعات المتعددة</h2>
        <p className="text-sm text-ink-300 mt-1">أدر مستودعاتك لتوزيع المخزون — {warehouses.length} مستودع</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <form onSubmit={add} className="glass rounded-3xl p-6 space-y-4 self-start">
            <h3 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-neon-400" /> مستودع جديد</h3>
            <input className="inp" placeholder="اسم المستودع *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="inp" placeholder="الموقع" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input className="inp" placeholder="المسؤول" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold w-full flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} إضافة
            </button>
          </form>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {warehouses.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">لا مستودعات بعد — أضف أول مستودع</div>
            ) : (
              warehouses.map((w) => (
                <div key={w.id} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift">
                  <div className="flex items-start justify-between">
                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/20 to-viol-500/15 border border-white/10"><Warehouse className="w-5 h-5 text-neon-400" /></span>
                    <button onClick={() => remove(w.id)} className="btn-ghost rounded-xl p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="font-bold">{w.name}</p>
                  {w.location && <p className="text-xs text-ink-300 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-neon-400" /> {w.location}</p>}
                  {w.manager && <p className="text-xs text-ink-300">المسؤول: {w.manager}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
