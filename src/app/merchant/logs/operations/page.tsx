"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ScrollText } from "lucide-react";
import { toast } from "sonner";

type Log = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
};

const ACTION_LABEL: Record<string, string> = {
  "inventory.adjust": "تعديل مخزون",
  "inventory.set": "ضبط مخزون",
  "category.create": "إنشاء قسم",
  "category.update": "تحديث قسم",
  "category.delete": "حذف قسم",
  "staff.add": "إضافة موظف",
  "staff.update": "تحديث موظف",
  "staff.remove": "إزالة موظف",
};

export default function OperationsLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/merchant/audit?action=${encodeURIComponent(action)}`);
      const d = await r.json();
      setLogs(d.logs ?? []);
    } catch {
      toast.error("تعذر تحميل السجل");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [action]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">سجل العمليات</h2>
          <p className="text-sm text-ink-300 mt-1">سجل تدقيق لجميع العمليات الحساسة في متجرك — {logs.length} عملية</p>
        </div>
        <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setAction("all")}
          className={`rounded-2xl px-4 py-2 text-xs font-semibold ${action === "all" ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}
        >
          الكل
        </button>
        {Object.entries(ACTION_LABEL).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setAction(k)}
            className={`rounded-2xl px-4 py-2 text-xs font-semibold ${action === k ? "bg-neon-400/15 text-neon-400 border border-neon-400/40" : "btn-ghost"}`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm">جارٍ التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا عمليات مسجلة بعد — سجّل العمليات تُسجَّل تلقائيًا عند تعديل المخزون أو الأقسام أو الموظفين</div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((l) => (
              <div key={l.id} className="px-5 py-3.5 flex items-start gap-4">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 shrink-0 mt-0.5">
                  <ScrollText className="w-4.5 h-4.5 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{ACTION_LABEL[l.action] ?? l.action}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-latin">{l.entity}</span>
                  </div>
                  {l.meta && Object.keys(l.meta).length > 0 && (
                    <p className="text-[11px] text-ink-300 mt-1 font-latin truncate">{JSON.stringify(l.meta)}</p>
                  )}
                </div>
                <p className="text-[11px] text-ink-300 font-latin shrink-0 mt-1">
                  {new Date(l.createdAt).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
