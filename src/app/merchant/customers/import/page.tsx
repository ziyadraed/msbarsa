"use client";

import { useState } from "react";
import { Upload, Download, Loader2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE = "الاسم,البريد,الجوال\nأحمد محمد,ahmed@example.com,0550000000\n";

export default function CustomersImportPage() {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  async function importCsv() {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/merchant/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "فشل الاستيراد");
      setResult(d);
      toast.success(`تم استيراد ${d.created} عميل`);
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">استيراد العملاء</h2>
        <p className="text-sm text-ink-300 mt-1">استورد قاعدة عملائك من ملف CSV</p>
      </div>

      <button onClick={downloadTemplate} className="btn-ghost rounded-2xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
        <Download className="w-4 h-4" /> قالب جاهز
      </button>

      <div className="glass rounded-3xl p-6 space-y-4">
        <label className="block">
          <span className="block text-xs text-ink-300 mb-2">محتوى ملف CSV — الأعمدة: الاسم، البريد (اختياري: الجوال)</span>
          <textarea className="inp !h-44 font-latin text-left" dir="ltr" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="الاسم,البريد,الجوال&#10;سارة محمد,sara@example.com,0551111111" />
        </label>
        <div className="flex items-center gap-3">
          <button onClick={importCsv} disabled={busy || !csv.trim()} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} استيراد
          </button>
          {csv && !busy && (
            <button onClick={() => { setCsv(""); setResult(null); }} className="btn-ghost rounded-2xl px-4 py-3 text-sm flex items-center gap-1.5">
              <X className="w-4 h-4" /> مسح
            </button>
          )}
          {result && (
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> استُورد {result.created} (تجاهل {result.skipped})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
