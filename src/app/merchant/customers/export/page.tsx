"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";

type C = { id: string; name: string; email: string; phone: string; totalSpent: number; orderCount: number; tags: string[] };

export default function ExportCustomersPage() {
  const [loaded, setLoaded] = useState(false);
  const [customers, setCustomers] = useState<C[]>([]);

  useEffect(() => {
    fetch("/api/merchant/customers").then((r) => r.json()).then((d) => {
      setCustomers(Array.isArray(d.customers) ? d.customers : []);
    }).finally(() => setLoaded(true));
  }, []);

  function exportCsv() {
    const header = "الاسم,البريد,الجوال,الإنفاق,الطلبات,الوسوم\n";
    const body = customers.map((c) => `${c.name.replace(/,/g, " ")},${c.email},${c.phone},${c.totalSpent},${c.orderCount},"${(c.tags || []).join(";")}"`).join("\n");
    const blob = new Blob(["\ufeff" + header + body], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `customers-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تصدير العملاء</h2><p className="text-sm text-ink-300 mt-1">نزّل قائمة عملائك كملف CSV</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Download className="w-5 h-5 text-emerald-400" /></span>
            <div><p className="font-bold text-sm">{customers.length} عميل جاهز للتصدير</p><p className="text-[11px] text-ink-300">الاسم، البريد، الجوال، الإنفاق، الطلبات، الوسوم</p></div>
          </div>
          <button onClick={exportCsv} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
        </div>
      )}
    </div>
  );
}
