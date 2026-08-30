"use client";

import { useEffect, useState } from "react";
import { Landmark, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Acc = { id: string; bank: string; holder: string; iban: string };

export default function BankAccountsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<Acc[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.paymentBankAccounts)) setAccounts(s.paymentBankAccounts as Acc[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { paymentBankAccounts: accounts } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الحسابات البنكية");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";
  const lbl = "block text-xs text-ink-300 mb-1";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">الحسابات البنكية</h2><p className="text-sm text-ink-300 mt-1">إدارة حسابات استقبال التحويلات</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-400/15 border border-blue-400/30"><Landmark className="w-5 h-5 text-blue-400" /></span>
              <p className="font-bold text-sm">{accounts.length} حساب</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((a) => (
              <div key={a.id} className="space-y-2 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <input className={inp} value={a.bank} onChange={(e) => setAccounts((p) => p.map((x) => x.id === a.id ? { ...x, bank: e.target.value } : x))} placeholder="اسم البنك" />
                  <input className={inp} value={a.holder} onChange={(e) => setAccounts((p) => p.map((x) => x.id === a.id ? { ...x, holder: e.target.value } : x))} placeholder="اسم المستفيد" />
                </div>
                <div className="flex gap-2">
                  <input className={inp + " flex-1 font-latin text-left"} value={a.iban} onChange={(e) => setAccounts((p) => p.map((x) => x.id === a.id ? { ...x, iban: e.target.value } : x))} placeholder="SA00 0000..." />
                  <button type="button" onClick={() => setAccounts((p) => p.filter((x) => x.id !== a.id))} className="text-ink-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {accounts.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد حسابات — أضف حسابًا بنكيًا</p>}
          </div>

          <button type="button" onClick={() => setAccounts((p) => [...p, { id: crypto.randomUUID(), bank: "", holder: "", iban: "" }])} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-ink-300 hover:text-neon-400">
            <Plus className="w-4 h-4" /> إضافة حساب
          </button>
        </div>
      )}
    </div>
  );
}
