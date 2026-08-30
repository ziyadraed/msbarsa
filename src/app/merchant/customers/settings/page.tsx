"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function CustomerSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ selfRegister: true, requirePhone: false, autoGroup: false, newsletter: true });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setForm({
        selfRegister: s.custSelfRegister !== false,
        requirePhone: s.custRequirePhone === true,
        autoGroup: s.custAutoGroup === true,
        newsletter: s.custNewsletter !== false,
      });
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { custSelfRegister: form.selfRegister, custRequirePhone: form.requirePhone, custAutoGroup: form.autoGroup, custNewsletter: form.newsletter } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات العملاء");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ label, desc, val, onChange }: { label: string; desc: string; val: boolean; onChange: () => void }) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
        <div><p className="text-sm font-semibold">{label}</p><p className="text-[11px] text-ink-300">{desc}</p></div>
        <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${val ? "bg-neon-500" : "bg-white/15"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${val ? "right-0.5" : "right-5.5"}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">إعدادات العملاء</h2><p className="text-sm text-ink-300 mt-1">تحكم في سلوك واشتراكات العملاء</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><Users className="w-5 h-5 text-sky-400" /></span>
            <p className="font-bold text-sm">تفضيلات العملاء</p>
          </div>
          <Toggle label="تسجيل العملاء ذاتيًا" desc="السماح بإنشاء حسابات عملاء" val={form.selfRegister} onChange={() => setForm({ ...form, selfRegister: !form.selfRegister })} />
          <Toggle label="مطالبة برقم الجوال" desc="إلزام رقم الجوال عند التسجيل" val={form.requirePhone} onChange={() => setForm({ ...form, requirePhone: !form.requirePhone })} />
          <Toggle label="تجميع تلقائي" desc="إضافة العملاء لمجموعات حسب السلوك" val={form.autoGroup} onChange={() => setForm({ ...form, autoGroup: !form.autoGroup })} />
          <Toggle label="نشرة بريدية" desc="اشتراك تلقائي في النشرة" val={form.newsletter} onChange={() => setForm({ ...form, newsletter: !form.newsletter })} />
          <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}
