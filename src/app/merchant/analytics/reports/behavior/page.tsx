"use client";

import { useEffect, useState } from "react";
import { Activity, Loader2, Repeat } from "lucide-react";

export default function BehaviorPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ repeat: { name: string; n: number; total: number }[] }>({ repeat: [] });

  useEffect(() => {
    fetch("/api/merchant/reports?type=behavior").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تحليلات سلوك العملاء</h2><p className="text-sm text-ink-300 mt-1">العملاء المكررون الأكثر قيمة</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-400/15 border border-orange-400/30"><Activity className="w-5 h-5 text-orange-400" /></span>
            <div><p className="font-bold text-sm">عملاء بأكثر من طلب</p><p className="text-[11px] text-ink-300">{data.repeat.length} عميل مكرر</p></div>
          </div>
          <div className="space-y-2">
            {data.repeat.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا يوجد عملاء مكررون بعد</p>}
            {data.repeat.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-orange-400/15 text-orange-400"><Repeat className="w-4 h-4" /></span>
                <p className="flex-1 text-sm font-semibold truncate">{c.name}</p>
                <span className="text-[11px] text-ink-300">{c.n} طلبات</span>
                <span className="text-sm font-latin font-bold">{c.total.toLocaleString()} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
