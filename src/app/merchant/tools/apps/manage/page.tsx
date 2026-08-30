"use client";

import { useEffect, useState } from "react";
import { Puzzle, Loader2, Power } from "lucide-react";
import { toast } from "sonner";

type App = { id: string; name: string; desc: string; enabled: boolean };

const ALL_APPS: App[] = [
  { id: "shipping", name: "شحن سريع", desc: "ربط شركات الشحن", enabled: true },
  { id: "loyalty", name: "نظام الولاء", desc: "نقاط ومكافآت", enabled: true },
  { id: "reviews", name: "تقييمات المنتجات", desc: "آراء العملاء", enabled: true },
  { id: "chat", name: "محادثة فورية", desc: "دعم مباشر", enabled: true },
  { id: "analytics", name: "تحليلات متقدمة", desc: "تقارير أعمق", enabled: true },
  { id: "sms", name: "حملات SMS", desc: "رسائل تسويقية", enabled: true },
];

export default function ManageAppsPage() {
  const [loaded, setLoaded] = useState(false);
  const [installed, setInstalled] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.installedApps)) setInstalled(s.installedApps as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { installedApps: installed } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إدارة التطبيقات");
    } finally { setSaving(false); }
  }

  function toggle(id: string) {
    setInstalled((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  const shown = ALL_APPS.filter((a) => installed.includes(a.id));
  const rest = ALL_APPS.filter((a) => !installed.includes(a.id));

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">إدارة التطبيقات المثبتة</h2><p className="text-sm text-ink-300 mt-1">شغّل أو أوقف التطبيقات المثبتة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Puzzle className="w-5 h-5 text-emerald-400" /></span>
              <p className="font-bold text-sm">{installed.length} تطبيق</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />} حفظ
            </button>
          </div>
          {shown.length === 0 && <p className="text-xs text-ink-300/60 border border-dashed border-white/10 rounded-xl p-3 text-center">لا توجد تطبيقات مثبتة — ثبّت من متجر التطبيقات</p>}
          {shown.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 border border-white/10"><Puzzle className="w-4 h-4 text-neon-400" /></span>
              <div className="flex-1"><p className="text-sm font-bold">{a.name}</p><p className="text-[11px] text-ink-300">{a.desc}</p></div>
              <button type="button" onClick={() => toggle(a.id)} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${installed.includes(a.id) ? "bg-emerald-500" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${installed.includes(a.id) ? "right-0.5" : "right-5.5"}`} />
              </button>
            </div>
          ))}
          {rest.length > 0 && (
            <p className="text-[11px] text-ink-300 mt-2">متوفر لكن غير مثبّت: {rest.map((a) => a.name).join("، ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
