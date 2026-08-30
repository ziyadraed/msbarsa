"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, Trash2, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

const PERMS = [
  { id: "products", label: "المنتجات والمخزون" },
  { id: "orders", label: "الطلبات والمرتجعات" },
  { id: "customers", label: "العملاء" },
  { id: "marketing", label: "التسويق والكوبونات" },
  { id: "shipping", label: "الشحن" },
  { id: "reports", label: "التقارير" },
  { id: "staff", label: "إدارة الموظفين" },
  { id: "settings", label: "الإعدادات" },
];

type Role = { name: string; permissions: string[] };

const DEFAULT_ROLES: Role[] = [
  { name: "مدير", permissions: PERMS.map((p) => p.id) },
  { name: "موظف مبيعات", permissions: ["products", "orders", "customers"] },
  { name: "محاسب", permissions: ["orders", "reports"] },
];

export default function StaffRolesPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [newRole, setNewRole] = useState("");

  async function load() {
    try {
      const r = await fetch("/api/merchant/settings");
      const d = await r.json();
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.customRoles)) setRoles(s.customRoles as Role[]);
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { customRoles: roles } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الأدوار");
    } finally {
      setSaving(false);
    }
  }

  function togglePerm(ri: number, perm: string) {
    setRoles((prev) => {
      const next = prev.map((r, i) => {
        if (i !== ri) return r;
        const has = r.permissions.includes(perm);
        return { ...r, permissions: has ? r.permissions.filter((p) => p !== perm) : [...r.permissions, perm] };
      });
      return next;
    });
  }

  function addRole() {
    const n = newRole.trim();
    if (!n) return toast.error("أدخل اسم الدور");
    if (roles.some((r) => r.name === n)) return toast.error("الدور موجود");
    setRoles((prev) => [...prev, { name: n, permissions: [] }]);
    setNewRole("");
  }

  function removeRole(i: number) {
    setRoles((prev) => prev.filter((_, x) => x !== i));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الأدوار الوظيفية</h2>
          <p className="text-sm text-ink-300 mt-1">حدد الصلاحيات لكل دور في فريقك</p>
        </div>
        <div className="flex items-center gap-2">
          <input className="inp !w-44" placeholder="دور جديد..." value={newRole} onChange={(e) => setNewRole(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRole()} />
          <button onClick={addRole} className="btn-ghost rounded-2xl px-3 py-2.5 grid place-items-center"><Plus className="w-4 h-4" /></button>
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-12 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {roles.map((r, ri) => (
            <div key={r.name} className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5"><Shield className="w-5 h-5 text-neon-400" /></span>
                  <p className="font-bold">{r.name}</p>
                </div>
                <button onClick={() => removeRole(ri)} className="btn-ghost rounded-xl p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PERMS.map((p) => {
                  const on = r.permissions.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePerm(ri, p.id)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs border text-right ${on ? "bg-neon-400/15 text-neon-400 border-neon-400/40" : "bg-white/3 text-ink-300 border-white/10"}`}
                    >
                      <span className={`w-4 h-4 rounded grid place-items-center border ${on ? "bg-neon-500 border-neon-500" : "border-white/20"}`}>
                        {on && <Check className="w-3 h-3 text-ink-950" />}
                      </span>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
