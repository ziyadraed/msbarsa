"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";

type P = { id: string; name: string; sku: string; stock: number; price: number };

export default function ExportInventoryPage() {
  const [loaded, setLoaded] = useState(false);
  const [prods, setProds] = useState<P[]>([]);

  useEffect(() => {
    fetch("/api/merchant/products?limit=1000").then((r) => r.json()).then((d) => {
      setProds(Array.isArray(d.products) ? d.products : []);
    }).finally(() => setLoaded(true));
  }, []);

  function exportCsv() {
    const header = "الاسم,SKU,المخزون,السعر\n";
    const body = prods.map((p) => `${p.name.replace(/,/g, " ")},"${p.sku || ""}",${p.stock},${p.price}`).join("\n");
    const blob = new Blob(["\ufeff" + header + body], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inventory-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">تصدير المخزون</h2><p className="text-sm text-ink-300 mt-1">نزّل بيانات مخزونك الحالية كملف CSV</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-400/15 border border-emerald-400/30"><Download className="w-5 h-5 text-emerald-400" /></span>
            <div><p className="font-bold text-sm">{prods.length} منتج جاهز للتصدير</p><p className="text-[11px] text-ink-300">يتضمن الاسم، SKU، المخزون، والسعر</p></div>
          </div>
          <button onClick={exportCsv} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
        </div>
      )}
    </div>
  );
}
