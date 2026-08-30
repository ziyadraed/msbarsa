"use client";

import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const EXPORTS = [
  { id: "orders", label: "تصدير الطلبات", desc: "كل الطلبات مع تفاصيل المنتجات والعملاء", file: "orders.csv" },
  { id: "customers", label: "تصدير العملاء", desc: "قائمة العملاء مع إنفاقهم وعدد طلباتهم", file: "customers.csv" },
  { id: "products", label: "تصدير المنتجات", desc: "المنتجات مع الأسعار والمخزون والأقسام", file: "products.csv" },
];

export default function ExportTemplatesPage() {
  const [busy, setBusy] = useState<string | null>(null);

  async function download(id: string) {
    setBusy(id);
    try {
      const r = await fetch(`/api/merchant/export?type=${id}`);
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        return toast.error(d.error || "تعذر التصدير");
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = EXPORTS.find((e) => e.id === id)?.file ?? "export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("تم تجهيز الملف للتنزيل");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">قوالب التصدير</h2>
        <p className="text-sm text-ink-300 mt-1">صدّر بيانات متجرك بصيغة CSV لاستخدامها في أدوات المحاسبة والتحليل</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {EXPORTS.map((e) => (
          <div key={e.id} className="glass rounded-3xl p-6 flex flex-col gap-4 hover-lift">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-neon-500/15 border border-white/10">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </span>
            <div>
              <h3 className="font-bold text-sm">{e.label}</h3>
              <p className="text-xs text-ink-300 mt-1.5 leading-relaxed">{e.desc}</p>
            </div>
            <button
              onClick={() => download(e.id)}
              disabled={busy === e.id}
              className="btn-primary rounded-2xl px-5 py-3 text-sm font-bold flex items-center justify-center gap-2 mt-auto disabled:opacity-60"
            >
              {busy === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} تنزيل CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
