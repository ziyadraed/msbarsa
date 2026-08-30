"use client";

import { useEffect, useState } from "react";
import { Users, Tag, Plus, X, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  tags: string[];
  notes?: string;
};

const PRESET_TAGS = ["عميل جديد", "دائم", "نشط", "سلة متروكة", "VIP"];

export default function CustomerGroupsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  const allTags = Array.from(new Set(customers.flatMap((c) => c.tags)));
  const visible = filter ? customers.filter((c) => c.tags.includes(filter)) : customers;

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/customers");
      const d = await r.json();
      setCustomers(d.customers ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function saveTags(tags: string[], notes?: string) {
    if (!editing) return;
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, tags, notes }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الحفظ");
      setCustomers((prev) => prev.map((c) => (c.id === editing.id ? { ...c, tags: d.tags, notes: d.notes ?? c.notes } : c)));
      toast.success("تم تحديث المجموعات");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  function toggleTag(tag: string) {
    if (!editing) return;
    const next = editing.tags.includes(tag) ? editing.tags.filter((t) => t !== tag) : [...editing.tags, tag];
    setEditing({ ...editing, tags: next });
    saveTags(next);
  }

  function addCustomTag() {
    const t = newTag.trim();
    if (!t || !editing) return;
    if (!editing.tags.includes(t)) {
      const next = [...editing.tags, t];
      setEditing({ ...editing, tags: next });
      setNewTag("");
      saveTags(next);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">مجموعات العملاء</h2>
          <p className="text-sm text-ink-300 mt-1">نظّم عملاءك بوسوم وأقسام لاستهداف حملاتك — {customers.length} عميل</p>
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`rounded-2xl px-4 py-2 text-xs font-semibold ${!filter ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}
        >
          الكل ({customers.length})
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(filter === t ? "" : t)}
            className={`rounded-2xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 ${filter === t ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}
          >
            <Tag className="w-3.5 h-3.5" /> {t} ({customers.filter((c) => c.tags.includes(t)).length})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">جارٍ التحميل...</div>
        ) : visible.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm col-span-full">لا عملاء في هذه المجموعة</div>
        ) : (
          visible.map((c) => (
            <div key={c.id} className="glass rounded-3xl p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-gradient-to-br from-neon-500/20 to-viol-500/20 border border-white/10 shrink-0">
                  <Users className="w-5 h-5 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{c.name}</p>
                  <p className="text-[11px] text-ink-300 font-latin truncate">{c.email}</p>
                  <p className="text-[11px] text-ink-300 font-latin mt-1">{c.orderCount} طلب · {c.totalSpent} ر.س</p>
                </div>
                <button onClick={() => setEditing(editing?.id === c.id ? null : c)} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold shrink-0">
                  {editing?.id === c.id ? "إغلاق" : "تعديل"}
                </button>
              </div>

              {editing?.id === c.id ? (
                <div className="border-t border-white/8 pt-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TAGS.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleTag(t)}
                        className={`text-[11px] px-3 py-1.5 rounded-full border ${editing.tags.includes(t) ? "bg-neon-400/20 text-neon-400 border-neon-400/50" : "bg-white/5 text-ink-300 border-white/10"}`}
                      >
                        {t}
                      </button>
                    ))}
                    {editing.tags.filter((t) => !PRESET_TAGS.includes(t)).map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleTag(t)}
                        className="text-[11px] px-3 py-1.5 rounded-full border bg-neon-400/20 text-neon-400 border-neon-400/50 flex items-center gap-1"
                      >
                        {t} <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="inp !py-2 flex-1"
                      placeholder="وسم جديد..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                    />
                    <button onClick={addCustomTag} disabled={saving} className="btn-ghost rounded-xl px-3 flex items-center gap-1 text-xs font-semibold disabled:opacity-50">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} إضافة
                    </button>
                  </div>
                </div>
              ) : (
                c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-neon-400/10 text-neon-400 border border-neon-400/20 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {t}
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
