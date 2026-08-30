"use client";

import { useEffect, useState } from "react";
import { Wallet, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

export default function WalletsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.digitalWallets)) setEnabled(s.digitalWallets as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { digitalWallets: enabled } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ المحافظ الرقمية");
    } finally {
      setSaving(false);
    }
  }

  const WALLETS = [
    { id: "stc", name: "STC Pay", desc: "تحويل عبر الجوال" },
    { id: "apple", name: "Apple Pay", desc: "محفظة آبل" },
    { id: "google", name: "Google Pay", desc: "محفظة جوجل" },
    { id: "urpay", name: "UrPay", desc: "محفظة سعودية" },
  ];

  function toggle(id: string) {
    setEnabled((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">المحافظ الرقمية</h2><p className="text-sm text-ink-300 mt-1">فعّل المحافظ التي يقبلها متجرك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-blue-400/15 border border-indigo-400/30"><Wallet className="w-5 h-5 text-indigo-400" /></span>
              <p className="font-bold text-sm">{enabled.length} محفظة مفعّلة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-2">
            {WALLETS.map((w) => {
              const on = enabled.includes(w.id);
              return (
                <button key={w.id} onClick={() => toggle(w.id)} className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-right ${on ? "border-indigo-400/40 bg-indigo-400/10" : "border-white/10 bg-white/3"}`}>
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 border border-white/10"><Wallet className="w-4 h-4 text-ink-300" /></span>
                  <div className="flex-1"><p className="text-sm font-bold">{w.name}</p><p className="text-[11px] text-ink-300">{w.desc}</p></div>
                  {on && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
