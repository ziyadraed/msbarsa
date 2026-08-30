"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

type P = { id: string; name: string; stock: number };

export default function ImportInventoryPage() {
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ name: string; current: number; newStock: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines[0].toLowerCase();
    const idxName = header.split(",").indexOf("name") >= 0 ? header.split(",").indexOf("name") : 0;
    const idxStock = header.split(",").findIndex((h) => h.includes("stock") || h.includes("كمية"));
    if (idxStock < 0) return toast.error("ملف غير صالح — تأكد من عمود المخزون");
    const d = await fetch("/api/merchant/products?limit=1000").then((r) => r.json());
    const all = (Array.isArray(d.products) ? d.products : []) as P[];
    const rows: typeof preview = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const name = cols[idxName]?.trim();
      const stock = Number(cols[idxStock]?.trim());
      const found = all.find((p) => p.name === name);
      if (found && !Number.isNaN(stock)) rows.push({ name, current: found.stock, newStock: stock });
    }
    setPreview(rows);
    if (!rows.length) toast.error("لم يتم العثور على منتجات مطابقة");
  }

  async function apply() {
    setSaving(true);
    let ok = 0;
    try {
      const d = await fetch("/api/merchant/products?limit=1000").then((r) => r.json());
      const all = (Array.isArray(d.products) ? d.products : []) as P[];
      for (const r of preview) {
        const p = all.find((x) => x.name === r.name)!;
        const res = await fetch("/api/merchant/products", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: p.id, stock: r.newStock }),
        });
        if (res.ok) ok++;
      }
      toast.success(`تم تحديث مخزون ${ok} منتج`);
      setPreview([]);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">استيراد المخزون</h2><p className="text-sm text-ink-300 mt-1">حدّث المخزون بالجملة من ملف CSV</p></div>
      <div className="glass rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 border border-sky-400/30"><Upload className="w-5 h-5 text-sky-400" /></span>
          <p className="font-bold text-sm">ارفع ملف CSV</p>
        </div>
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border border-dashed border-white/15 p-8 text-center text-ink-300 hover:text-neon-400 flex flex-col items-center gap-2">
          <FileText className="w-6 h-6" />
          <span className="text-sm">اسحب ملف CSV أو انقر للاستعراض</span>
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />

        {preview.length > 0 && (
          <>
            <div className="max-h-64 overflow-y-auto space-y-1 border border-white/10 rounded-xl p-2">
              {preview.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg bg-ink-900/40">
                  <span className="truncate pe-2">{r.name}</span>
                  <span className="text-ink-300 text-xs shrink-0">{r.current} ← <b className="text-neon-400">{r.newStock}</b></span>
                </div>
              ))}
            </div>
            <button onClick={apply} disabled={saving} className="btn-primary rounded-2xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} تطبيق ({preview.length})
            </button>
          </>
        )}
      </div>
    </div>
  );
}
