"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Boxes, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

type Log = { id: string; action: string; entity: string; meta: Record<string, unknown>; createdAt: string };

export default function InventoryLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/merchant/audit");
        const d = await r.json();
        setLogs((d.logs ?? []).filter((l: Log) => l.action.startsWith("inventory.")));
      } catch {
        toast.error("تعذر تحميل السجل");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">سجل المخزون</h2>
          <p className="text-sm text-ink-300 mt-1">تتبّع تعديلات كمية المخزون — {logs.length} عملية</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا تعديلات مخزون بعد — عدّل المخزون من إدارة المخزون ليُسجَّل هنا</div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((l) => {
              const before = Number(l.meta?.before ?? 0);
              const after = Number(l.meta?.after ?? 0);
              const delta = after - before;
              const inc = delta >= 0;
              return (
                <div key={l.id} className="px-5 py-3.5 flex items-center gap-4">
                  <span className={`grid place-items-center w-9 h-9 rounded-xl ${inc ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"} shrink-0`}>
                    {inc ? <ArrowUpRight className="w-4.5 h-4.5" /> : <ArrowDownRight className="w-4.5 h-4.5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{inc ? "إضافة للمخزون" : "خصم من المخزون"}</p>
                    <p className="text-[11px] text-ink-300 font-latin">من {before} → إلى {after} ({delta > 0 ? "+" : ""}{delta})</p>
                  </div>
                  <p className="text-[11px] text-ink-300 font-latin shrink-0">{new Date(l.createdAt).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
