"use client";

import { useEffect, useState } from "react";
import { Rocket, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

export default function AdsPlatformsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [platforms, setPlatforms] = useState<Record<string, { enabled: boolean; budget: number; goal: string }>>({
    google: { enabled: false, budget: 0, goal: "مبيعات" },
    tiktok: { enabled: false, budget: 0, goal: "مبيعات" },
    snapchat: { enabled: false, budget: 0, goal: "مبيعات" },
    facebook: { enabled: false, budget: 0, goal: "مبيعات" },
  });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings?.adsPlatforms;
      if (s) setPlatforms({ ...platforms, ...s });
    }).finally(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { adsPlatforms: platforms } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ إعدادات حملات المنصات");
    } finally { setSaving(false); }
  }

  const PLATFORMS = [
    { id: "google", name: "Google", desc: "حملة Google بهدف المبيعات" },
    { id: "tiktok", name: "TikTok", desc: "حملة TikTok بهدف المبيعات" },
    { id: "snapchat", name: "Snapchat", desc: "Snapchat Business" },
    { id: "facebook", name: "Facebook / Instagram", desc: "Facebook & Instagram Catalog" },
  ];

  const inp = "w-full rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm outline-none focus:border-neon-400/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">حملات منصات الإعلانات</h2><p className="text-sm text-ink-300 mt-1">اربط متجرك بمنصات الإعلانات المستهدفة للمبيعات</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30"><Rocket className="w-5 h-5 text-viol-400" /></span>
              <p className="font-bold text-sm">{Object.values(platforms).filter((p) => p.enabled).length} منصة مفعّلة</p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
          </div>
          <div className="space-y-3">
            {PLATFORMS.map((pl) => {
              const p = platforms[pl.id];
              return (
                <div key={pl.id} className="rounded-xl border border-white/10 bg-ink-900/40 p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="flex-1">
                      <p className="text-sm font-bold">{pl.name}</p>
                      <p className="text-[11px] text-ink-300">{pl.desc}</p>
                    </span>
                    <button type="button" onClick={() => setPlatforms((prev) => ({ ...prev, [pl.id]: { ...prev[pl.id], enabled: !prev[pl.id].enabled } }))} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${p.enabled ? "bg-neon-500" : "bg-white/15"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${p.enabled ? "right-0.5" : "right-5.5"}`} />
                    </button>
                  </div>
                  {p.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" className={inp} value={p.budget} onChange={(e) => setPlatforms((prev) => ({ ...prev, [pl.id]: { ...prev[pl.id], budget: Number(e.target.value) } }))} placeholder="الميزانية اليومية" />
                      <select className={inp} value={p.goal} onChange={(e) => setPlatforms((prev) => ({ ...prev, [pl.id]: { ...prev[pl.id], goal: e.target.value } }))}>
                        <option>مبيعات</option><option>زيارات</option><option>تفاعل</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
