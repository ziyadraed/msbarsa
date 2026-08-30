"use client";

import { useEffect, useState } from "react";
import { Warehouse, Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Branch = { id: string; name: string; city: string; address: string };

export default function BranchesPage() {
  const [loaded, setLoaded] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({ name: "", city: "", address: "" });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.branches)) setBranches(s.branches as Branch[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function persist(next: Branch[]) {
    await fetch("/api/merchant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "مسبار", design: { branches: next } }),
    });
  }

  async function addBranch(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("اسم الفرع مطلوب");
    const b: Branch = { id: Date.now().toString(36), name: form.name.trim(), city: form.city.trim(), address: form.address.trim() };
    const next = [...branches, b];
    setBranches(next);
    await persist(next);
    setForm({ name: "", city: "", address: "" });
    toast.success("تمت إضافة الفرع");
  }

  async function removeBranch(id: string) {
    if (!confirm("حذف هذا الفرع؟")) return;
    const next = branches.filter((b) => b.id !== id);
    setBranches(next);
    await persist(next);
    toast.success("تم الحذف");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">الفروع والمستودعات</h2>
        <p className="text-sm text-ink-300 mt-1">أدر مواقع متجرك لتوزيع المخزون — {branches.length} فرع</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <form onSubmit={addBranch} className="glass rounded-3xl p-6 space-y-4 self-start">
            <h3 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-neon-400" /> فرع جديد</h3>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">اسم الفرع *</span>
              <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">المدينة</span>
              <input className="inp" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">العنوان</span>
              <input className="inp" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <button type="submit" className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold w-full">إضافة</button>
          </form>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {branches.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">لا فروع بعد — أضف أول فرع أو مستودع</div>
            ) : (
              branches.map((b) => (
                <div key={b.id} className="glass rounded-3xl p-5 flex flex-col gap-3 hover-lift">
                  <div className="flex items-start justify-between">
                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/20 to-viol-500/15 border border-white/10">
                      <Warehouse className="w-5 h-5 text-neon-400" />
                    </span>
                    <button onClick={() => removeBranch(b.id)} className="btn-ghost rounded-xl p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="font-bold">{b.name}</p>
                  {(b.city || b.address) && (
                    <p className="text-xs text-ink-300 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-neon-400 shrink-0 mt-0.5" /> {[b.city, b.address].filter(Boolean).join("، ")}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
