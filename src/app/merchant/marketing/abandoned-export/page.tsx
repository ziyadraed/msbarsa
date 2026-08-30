"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";

type O = { id: string; orderNumber: string; customerName: string; email: string; total: number; status: string };

export default function AbandonedExportPage() {
  const [loaded, setLoaded] = useState(false);
  const [list, setList] = useState<O[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/merchant/orders?limit=500").then((r) => r.json()).then((d) => {
      const all = (Array.isArray(d.orders) ? d.orders : []).filter((o: O) => ["pending", "awaiting_payment"].includes(o.status));
      fetch("/api/merchant/settings").then((r) => r.json()).then((s) => {
        const h = s.store?.settings?.hiddenAbandoned ?? [];
        setHidden(h as string[]);
        setList(all.filter((o: O) => !(h as string[]).includes(o.id)));
      });
    }).finally(() => setLoaded(true));
  }, []);

  function exportCsv() {
    const header = "رقم الطلب,العميل,البريد,الإجمالي,الحالة\n";
    const body = list.map((o) => `${o.orderNumber},${o.customerName.replace(/,/g, " ")},${o.email},${o.total},${o.status}`).join("\n");
    const blob = new Blob(["\ufeff" + header + body], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `abandoned-carts-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تصدير السلات المتروكة</h2><p className="text-sm text-ink-300 mt-1">نزّل قائمة السلات المتروكة لعمل حملة استهداف</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Download className="w-5 h-5 text-emerald-400" /></span>
              <div><p className="font-bold text-sm">{list.length} سلة متروكة</p><p className="text-[11px] text-ink-300">بعد إخفاء {hidden.length}</p></div>
            </div>
            <button onClick={exportCsv} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              <Download className="w-4 h-4" /> تصدير CSV
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {list.length === 0 && <p className="text-xs text-ink-300/60 text-center py-4">لا توجد سلات متروكة</p>}
            {list.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg bg-ink-900/40 px-3 py-2 text-sm">
                <span className="truncate pe-2">{o.customerName}</span>
                <span className="text-ink-300 text-xs shrink-0 font-latin">#{o.orderNumber} · {o.total} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
