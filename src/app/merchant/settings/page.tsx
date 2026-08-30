"use client";

import { useEffect, useState } from "react";
import { Store, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      if (d.store) setForm({ name: d.store.name, email: d.store.email ?? "", phone: d.store.phone ?? "" });
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات المتجر");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">إعدادات المتجر</h2>
        <p className="text-sm text-ink-300 mt-1">معلومات متجرك العامة</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/20 border border-neon-400/30">
              <Store className="w-5 h-5 text-neon-400" />
            </span>
            <p className="font-bold">معلومات المتجر</p>
          </div>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">اسم المتجر *</span>
            <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">بريد المتجر</span>
            <input className="inp" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-300 mb-1.5">الجوال</span>
            <input className="inp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التغييرات
          </button>
        </form>
      )}
    </div>
  );
}
