"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

export default function GeoReportsPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ byRegion: { region: string; n: number }[] }>({ byRegion: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=geo").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const total = data.byRegion.reduce((s, r) => s + r.n, 0);
  const max = Math.max(1, ...data.byRegion.map((r) => r.n));

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">التوزيع الجغرافي</h2><p className="text-sm text-ink-300 mt-1">عملاؤك حسب المدن من عناوين الطلبات</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-pink-400/15 border border-rose-400/30"><MapPin className="w-5 h-5 text-rose-400" /></span>
            <div><p className="font-bold text-sm">حسب المدينة</p><p className="text-[11px] text-ink-300">{total} طلب إجمالًا</p></div>
          </div>
          <div className="space-y-3">
            {data.byRegion.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد عناوين مسجلة</p>}
            {data.byRegion.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="grid place-items-center w-7 h-7 rounded-lg text-[11px] font-bold bg-white/5 text-ink-300 shrink-0">{r.region.slice(0, 2)}</span>
                <span className="text-sm font-semibold w-40 truncate">{r.region}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400" style={{ width: `${(r.n / max) * 100}%` }} /></div>
                <span className="text-sm font-latin font-bold w-16 text-left">{r.n}</span>
                <span className="text-[11px] text-ink-300 w-14 text-left">{Math.round((r.n / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
