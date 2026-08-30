"use client";

import { useEffect, useState } from "react";
import { Puzzle, Loader2, Search, Check, Download, X } from "lucide-react";
import { toast } from "sonner";

type App = { id: string; name: string; desc: string; installed: boolean };

export default function AppsShopPage() {
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [installed, setInstalled] = useState<string[]>([]);
  const [installing, setInstalling] = useState(false);

  const APPS: App[] = [
    { id: "shipping", name: "شحن سريع", desc: "ربط شركات الشحن", installed: false },
    { id: "loyalty", name: "نظام الولاء", desc: "نقاط ومكافآت", installed: false },
    { id: "reviews", name: "تقييمات المنتجات", desc: "آراء العملاء", installed: false },
    { id: "chat", name: "محادثة فورية", desc: "دعم مباشر", installed: false },
    { id: "analytics", name: "تحليلات متقدمة", desc: "تقارير أعمق", installed: false },
    { id: "sms", name: "حملات SMS", desc: "رسائل تسويقية", installed: false },
  ];

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.installedApps)) setInstalled(s.installedApps as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  const filtered = APPS.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.desc.includes(q));

  async function toggle(a: App) {
    setInstalling(true);
    try {
      const next = installed.includes(a.id) ? installed.filter((x) => x !== a.id) : [...installed, a.id];
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { installedApps: next } }),
      });
      if (r.ok) {
        setInstalled(next);
        toast.success(installed.includes(a.id) ? `تم إزالة ${a.name}` : `تم تثبيت ${a.name}`);
      } else toast.error("تعذر التحديث");
    } finally { setInstalling(false); }
  }

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">متجر التطبيقات</h2><p className="text-sm text-ink-300 mt-1">وسّع متجرك بتطبيقات جاهزة — بحث، تثبيت، إدارة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <>
          <div className="glass rounded-3xl p-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-ink-300" />
            <input className="flex-1 bg-transparent outline-none text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن تطبيق..." />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const on = installed.includes(a.id);
              return (
                <div key={a.id} className="glass rounded-3xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500/25 to-viol-500/15 border border-neon-400/30"><Puzzle className="w-5 h-5 text-neon-400" /></span>
                    <div><p className="font-bold text-sm">{a.name}</p><p className="text-[11px] text-ink-300">{a.desc}</p></div>
                  </div>
                  <button onClick={() => toggle(a)} disabled={installing} className={`w-full rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 ${on ? "bg-white/10 text-ink-200 border border-white/10" : "bg-neon-400 text-ink-900"}`}>
                    {on ? <><X className="w-3.5 h-3.5" /> إزالة</> : <><Download className="w-3.5 h-3.5" /> تثبيت</>}
                  </button>
                  {on && <p className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 mt-2"><Check className="w-3 h-3" /> مثبّت</p>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
