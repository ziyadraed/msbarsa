"use client";

import { useEffect, useState } from "react";
import { Target, Loader2, CheckCircle2, ListTodo } from "lucide-react";

export default function ConversionPage() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ paid: number; total: number; rate: number }>({ paid: 0, total: 0, rate: 0 });

  useEffect(() => {
    fetch("/api/merchant/reports?type=conversion").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoaded(true));
  }, []);

  const pct = Math.min(100, data.rate);

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">معدل التحويل</h2><p className="text-sm text-ink-300 mt-1">نسبة الطلبات الناجحة من إجمالي الطلبات</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل البيانات...</div>
      ) : (
        <div className="glass rounded-3xl p-8 text-center">
          <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-viol-500/25 to-purple-400/15 border border-viol-400/30 mb-4"><Target className="w-6 h-6 text-viol-400" /></span>
          <p className="text-5xl font-black text-neon-400">{data.rate}%</p>
          <p className="text-sm text-ink-300 mt-2">معدل التحويل</p>
          <div className="mt-6 h-3 rounded-full bg-white/8 overflow-hidden max-w-sm mx-auto">
            <div className="h-full rounded-full bg-gradient-to-r from-viol-500 to-purple-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{data.paid}</p><p className="text-[11px] text-ink-300">طلبات ناجحة</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-4">
              <ListTodo className="w-4 h-4 text-ink-300 mx-auto mb-1" />
              <p className="text-xl font-bold">{data.total}</p><p className="text-[11px] text-ink-300">إجمالي الطلبات</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
