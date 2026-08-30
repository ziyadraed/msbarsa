"use client";

import { useEffect, useState } from "react";
import { MessageSquareWarning, Loader2, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";

type Complaint = { id: string; storeId: string; kind: string; name: string; email: string; subject: string; message: string; createdAt: string; status?: string };

export default function ComplaintsPage() {
  const [loaded, setLoaded] = useState(false);
  const [list, setList] = useState<Complaint[]>([]);
  const [view, setView] = useState<Complaint | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/messages?kind=support").then((r) => r.json()).then((d) => {
      setList((Array.isArray(d.messages) ? d.messages : []).map((m: any) => ({ ...m, status: m.status || "open" })));
    }).finally(() => setLoaded(true));
  }, []);

  async function resolve(c: Complaint) {
    setResolving(true);
    try {
      // Mark resolved locally for this session (message history is read-only source of record)
      setList((p) => p.map((x) => x.id === c.id ? { ...x, status: "resolved" } : x));
      setView(null);
      toast.success("تم إغلاق الشكوى");
    } finally {
      setResolving(false);
    }
  }

  const open = list.filter((c) => c.status !== "resolved");

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold">شكاوى العملاء</h2><p className="text-sm text-ink-300 mt-1">{open.length} شكوى مفتوحة من أصل {list.length}</p></div>
      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <div className="space-y-2">
          {list.length === 0 && <p className="text-xs text-ink-300/60 text-center py-6 border border-dashed border-white/10 rounded-3xl">لا توجد شكاوى مسجلة</p>}
          {list.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-4 flex items-center gap-3">
              <span className={`grid place-items-center w-10 h-10 rounded-xl ${c.status === "resolved" ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"}`}>
                {c.status === "resolved" ? <CheckCircle2 className="w-5 h-5" /> : <MessageSquareWarning className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{c.subject || "بدون عنوان"}</p>
                <p className="text-[11px] text-ink-300 truncate">{c.name} · {c.message?.slice(0, 60)}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full ${c.status === "resolved" ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"}`}>
                {c.status === "resolved" ? "مغلقة" : "مفتوحة"}
              </span>
              <button onClick={() => setView(c)} className="text-ink-300 hover:text-neon-400"><Eye className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {view && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setView(null)}>
          <div className="glass rounded-3xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold">{view.subject}</p>
            <p className="text-xs text-ink-300 mt-1">{view.name} · {view.email}</p>
            <p className="text-sm mt-4 text-ink-100 whitespace-pre-wrap">{view.message}</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setView(null)} className="px-4 py-2 rounded-xl text-sm border border-white/10 text-ink-300">إغلاق</button>
              {view.status !== "resolved" && (
                <button onClick={() => resolve(view)} disabled={resolving} className="btn-primary rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2">
                  {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} حل الشكوى
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
