"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

type P = { id: string; name: string; price: number; stock: number; shortDesc: string; categorySlug: string; images: string[] };

export default function DataQualityPage() {
  const [loaded, setLoaded] = useState(false);
  const [issues, setIssues] = useState<{ label: string; count: number; type: "warn" | "error" }[]>([]);

  useEffect(() => {
    fetch("/api/merchant/products?limit=500").then((r) => r.json()).then((d) => {
      const prods = (Array.isArray(d.products) ? d.products : []) as P[];
      const noDesc = prods.filter((p) => !p.shortDesc);
      const noStock = prods.filter((p) => (p.stock ?? 0) <= 0);
      const lowPrice = prods.filter((p) => p.price <= 0);
      const noImage = prods.filter((p) => !p.images || p.images.length === 0);
      setIssues([
        { label: "منتجات بدون وصف", count: noDesc.length, type: "warn" },
        { label: "منتجات بدون مخزون", count: noStock.length, type: "warn" },
        { label: "منتجات بسعر غير صالح", count: lowPrice.length, type: "error" },
        { label: "منتجات بدون صور", count: noImage.length, type: "warn" },
      ]);
    }).finally(() => setLoaded(true));
  }, []);

  const score = Math.max(0, Math.round(100 - issues.reduce((s, i) => s + i.count * 2, 0)));
  const errors = issues.filter((i) => i.type === "error").reduce((s, i) => s + i.count, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">جودة بيانات المنتجات</h2><p className="text-sm text-ink-300 mt-1">رصد الثغرات في بيانات منتجاتك لتحسين تجربة الشراء</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الفحص...</div>
      ) : (
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 text-center">
            <span className={`mx-auto grid place-items-center w-16 h-16 rounded-2xl mb-3 ${score >= 80 ? "bg-emerald-400/15 text-emerald-400" : "bg-amber-400/15 text-amber-400"}`}>
              <ShieldCheck className="w-8 h-8" />
            </span>
            <p className="text-4xl font-black">{score}%</p>
            <p className="text-sm text-ink-300 mt-1">مؤشر جودة البيانات</p>
            {errors > 0 && <p className="text-xs text-rose-400 mt-2">{errors} مشكلة حرجة تحتاج اهتمامًا</p>}
          </div>
          <div className="glass rounded-3xl p-6 space-y-2">
            {issues.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-3">
                <span className="text-sm font-semibold">{i.label}</span>
                <span className={`text-sm font-latin font-bold ${i.type === "error" ? "text-rose-400" : i.count ? "text-amber-400" : "text-emerald-400"}`}>{i.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
