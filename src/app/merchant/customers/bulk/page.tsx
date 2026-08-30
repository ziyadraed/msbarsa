"use client";

import { useEffect, useState } from "react";
import { Users, RefreshCw, Loader2, Ban, Trash2, Download, Search, Check } from "lucide-react";
import { toast } from "sonner";

type Customer = { id: string; name: string; email: string; totalSpent: number; orderCount: number; tags: string[] };

const BLOCK_TAG = "__blocked__";

export default function BulkCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/merchant/customers?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setCustomers((d.customers ?? []).map((c: Customer) => ({ ...c, tags: c.tags ?? [] })));
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function apply(fn: (c: Customer) => void) {
    const targets = customers.filter((c) => selected.has(c.id));
    if (!targets.length) return toast.error("اختر عميلًا واحدًا على الأقل");
    for (const c of targets) await fn(c);
    load();
  }

  async function toggleBlock(c: Customer) {
    const blocked = c.tags.includes(BLOCK_TAG);
    const tags = blocked ? c.tags.filter((t) => t !== BLOCK_TAG) : [...c.tags, BLOCK_TAG];
    await fetch("/api/merchant/customers", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, tags }),
    });
    toast.success(blocked ? "تم إلغاء حظر العميل" : "تم حظر العميل");
  }

  async function removeOne(c: Customer) {
    if (!confirm(`حذف العميل «${c.name}»؟`)) return;
    await fetch(`/api/merchant/customers?id=${c.id}`, { method: "DELETE" });
    toast.success("تم الحذف");
  }

  function exportSelected() {
    const targets = customers.filter((c) => selected.has(c.id));
    if (!targets.length) return toast.error("اختر عميلًا أولًا");
    const rows = ["الاسم,البريد,الطلبات,الإنفاق"];
    for (const c of targets) rows.push(`${c.name},${c.email},${c.orderCount},${c.totalSpent}`);
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customers.csv";
    a.click();
    toast.success("تم تصدير العملاء المحددين");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الإجراءات الجماعية للعملاء</h2>
          <p className="text-sm text-ink-300 mt-1">حدّد عملاء متعددين وطبّق إجراءات جماعية — {selected.size} محدد</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => apply((c) => toggleBlock(c))} className="rounded-2xl px-4 py-2.5 text-sm font-semibold border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 flex items-center gap-2">
            <Ban className="w-4 h-4" /> حظر/إلغاء حظر
          </button>
          <button onClick={exportSelected} className="btn-ghost rounded-2xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" /> تصدير المحدد
          </button>
          <button onClick={() => apply((c) => removeOne(c))} className="rounded-2xl px-4 py-2.5 text-sm font-semibold border border-red-400/30 text-red-300 hover:bg-red-400/10 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> حذف
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input className="inp pl-3 pr-10" placeholder="ابحث..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl px-4 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا عملاء بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            {customers.map((c) => {
              const blocked = c.tags.includes(BLOCK_TAG);
              const on = selected.has(c.id);
              return (
                <div key={c.id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/3">
                  <button onClick={() => toggle(c.id)} className={`w-5 h-5 rounded border grid place-items-center shrink-0 ${on ? "bg-neon-500 border-neon-500" : "border-white/25"}`}>
                    {on && <Check className="w-3.5 h-3.5 text-ink-950" />}
                  </button>
                  <span className={`grid place-items-center w-9 h-9 rounded-full border shrink-0 font-bold text-xs ${blocked ? "bg-rose-400/10 text-rose-400 border-rose-400/30" : "bg-gradient-to-br from-neon-500/20 to-viol-500/20 border-white/10"}`}>
                    {c.name?.[0] ?? "ع"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.name} {blocked && <span className="text-[10px] text-rose-400">(محظور)</span>}</p>
                    <p className="text-[11px] text-ink-300 font-latin truncate">{c.email}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="font-latin font-bold text-sm">{c.totalSpent} ر.س</p>
                    <p className="text-[10px] text-ink-300">{c.orderCount} طلب</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
