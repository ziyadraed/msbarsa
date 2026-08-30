"use client";

import { useEffect, useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Log = { id: string; action: string; entity: string; meta: Record<string, unknown>; createdAt: string };

const ENTITY_LABEL: Record<string, string> = { product: "منتج", category: "قسم", member: "موظف", coupon: "كوبون" };

export default function DeletedLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/merchant/audit");
        const d = await r.json();
        setLogs((d.logs ?? []).filter((l: Log) => l.action.endsWith(".delete")));
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
          <h2 className="text-2xl font-bold">سجل المحذوفات</h2>
          <p className="text-sm text-ink-300 mt-1">عمليات الحذف التي تمت في متجرك — {logs.length} عملية</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا عمليات حذف مسجّلة بعد</div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((l) => (
              <div key={l.id} className="px-5 py-3.5 flex items-center gap-4">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-rose-400/10 text-rose-400 shrink-0">
                  <Trash2 className="w-4.5 h-4.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">حذف {ENTITY_LABEL[l.entity] ?? l.entity}</p>
                  {l.meta && Object.keys(l.meta).length > 0 && (
                    <p className="text-[11px] text-ink-300 font-latin truncate">{JSON.stringify(l.meta)}</p>
                  )}
                </div>
                <p className="text-[11px] text-ink-300 font-latin shrink-0">{new Date(l.createdAt).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
