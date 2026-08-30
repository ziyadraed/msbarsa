"use client";

import { useEffect, useState } from "react";
import { Palette, Loader2, Search, Eye, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

type Theme = { id: string; name: string; category: string; price: number; installed: boolean };

export default function ThemesShopPage() {
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [installed, setInstalled] = useState<string[]>([]);
  const [installing, setInstalling] = useState(false);

  const THEMES: Theme[] = [
    { id: "aurora", name: "أورورا", category: "أزياء", price: 0, installed: false },
    { id: "nova", name: "نوفا", category: "إلكترونيات", price: 199, installed: false },
    { id: "oasis", name: "واحة", category: "عام", price: 0, installed: false },
    { id: "zenith", name: "زينث", category: "أثاث", price: 299, installed: false },
    { id: "luna", name: "لونا", category: "جمال", price: 149, installed: false },
    { id: "pearl", name: "لؤلؤة", category: "مطاعم", price: 99, installed: false },
  ];

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      if (Array.isArray(s.installedThemes)) setInstalled(s.installedThemes as string[]);
    }).finally(() => setLoaded(true));
  }, []);

  const filtered = THEMES.filter((t) =>
    (!q || t.name.toLowerCase().includes(q.toLowerCase())) &&
    (cat === "all" || t.category === cat));

  async function install(t: Theme) {
    setInstalling(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { installedThemes: installed.includes(t.id) ? installed : [...installed, t.id] } }),
      });
      if (r.ok) {
        setInstalled((p) => (p.includes(t.id) ? p : [...p, t.id]));
        toast.success(`تم تثبيت ثيم ${t.name}`);
      } else toast.error("تعذر التثبيت");
    } finally { setInstalling(false); }
  }

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">متجر الثيمات</h2><p className="text-sm text-ink-300 mt-1">ابحث واعاين وثبّت ثيمات لمتجرك</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <>
          <div className="glass rounded-3xl p-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-ink-300" />
            <input className="flex-1 bg-transparent outline-none text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن ثيم..." />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "أزياء", "إلكترونيات", "عام", "أثاث", "جمال", "مطاعم"].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${cat === c ? "bg-neon-400/15 text-neon-400 border border-neon-400/30" : "bg-white/5 text-ink-300 border border-white/10"}`}>{c === "all" ? "الكل" : c}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t.id} className="glass rounded-3xl overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-viol-500/30 to-neon-500/20 grid place-items-center"><Palette className="w-10 h-10 text-neon-400" /></div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-bold">{t.name}</p><p className="text-[11px] text-ink-300">{t.category}</p></div>
                    <span className="text-sm font-latin font-bold">{t.price === 0 ? "مجاني" : `${t.price} ر.س`}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs text-ink-200 hover:text-neon-400"><Eye className="w-3.5 h-3.5" /> معاينة</button>
                    {installed.includes(t.id) ? (
                      <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2 text-xs text-emerald-400"><Check className="w-3.5 h-3.5" /> مثبّت</button>
                    ) : (
                      <button onClick={() => install(t)} disabled={installing} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-neon-400 text-ink-900 py-2 text-xs font-bold"><ShoppingCart className="w-3.5 h-3.5" /> {t.price === 0 ? "تثبيت" : "شراء"}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
