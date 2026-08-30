"use client";

import { useEffect, useState } from "react";
import { UserPlus, RefreshCw, Trash2, Save, X, Loader2, Shield, Users } from "lucide-react";
import { toast } from "sonner";

type Member = {
  id: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  avatar: string;
};

const ROLE_LABEL: Record<string, string> = {
  owner: "المالك",
  manager: "مدير",
  staff: "موظف",
};

export default function StaffPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "staff" });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/merchant/staff");
      const d = await r.json();
      setMembers(d.members ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الإضافة");
      toast.success("تمت إضافة الموظف");
      setShowForm(false);
      setForm({ name: "", email: "", role: "staff" });
      load();
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(m: Member) {
    const role = m.role === "manager" ? "staff" : "manager";
    const r = await fetch("/api/merchant/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, role }),
    });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "فشل التعديل");
    toast.success("تم تحديث الدور");
    load();
  }

  async function remove(m: Member) {
    if (!confirm(`إزالة «${m.name}» من فريق المتجر؟`)) return;
    const r = await fetch(`/api/merchant/staff?id=${m.id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "فشل الإزالة");
    toast.success("تمت الإزالة");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الموظفون</h2>
          <p className="text-sm text-ink-300 mt-1">أدر فريق متجرك وصلاحياته — {members.length} عضو</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> إضافة موظف
        </button>
      </div>

      {showForm && (
        <form onSubmit={add} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-neon-400" /> موظف جديد</h3>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-xl p-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الاسم *</span>
              <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">البريد الإلكتروني *</span>
              <input className="inp font-latin" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-300 mb-1.5">الدور</span>
              <select className="inp" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">موظف</option>
                <option value="manager">مدير</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-2xl px-6 py-3 text-sm font-semibold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="glass rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <p className="text-xs text-ink-300">أعضاء الفريق</p>
          <button onClick={load} className="btn-ghost rounded-xl p-2"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا موظفين بعد — أضف أول عضو في الفريق</div>
        ) : (
          <div className="divide-y divide-white/5">
            {members.map((m) => (
              <div key={m.id} className="px-5 py-4 flex items-center gap-4">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-neon-500/20 to-viol-500/20 border border-white/10 shrink-0">
                  <Shield className="w-5 h-5 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{m.name}</p>
                  <p className="text-[11px] text-ink-300 truncate font-latin">{m.email}</p>
                </div>
                <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  <Users className="w-3.5 h-3.5 text-ink-300" /> {ROLE_LABEL[m.role] ?? m.role}
                </span>
                {m.role !== "owner" && (
                  <>
                    <button onClick={() => changeRole(m)} className="rounded-xl px-3 py-2 text-xs font-semibold border border-white/10 text-ink-300 hover:text-neon-400">
                      {m.role === "manager" ? "تحويل لموظف" : "ترقية لمدير"}
                    </button>
                    <button onClick={() => remove(m)} className="btn-ghost rounded-xl p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
