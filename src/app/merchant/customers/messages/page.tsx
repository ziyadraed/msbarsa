"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, MessageSquare, Loader2 } from "lucide-react";

type Msg = {
  id: string;
  kind: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

const KIND_LABEL: Record<string, string> = { support: "دعم", sales: "مبيعات", complaint: "شكوى", general: "عام" };

export default function MessagesPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/merchant/messages");
        const d = await r.json();
        setMessages(d.messages ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">رسائل العملاء</h2>
          <p className="text-sm text-ink-300 mt-1">الرسائل الواردة من نموذج التواصل — {messages.length} رسالة</p>
        </div>
        <button onClick={() => setLoading(false)} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا رسائل بعد — ستظهر هنا رسائل العملاء من صفحة التواصل</div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map((m) => (
              <div key={m.id}>
                <button onClick={() => setOpen(open === m.id ? null : m.id)} className="w-full px-5 py-4 flex items-center gap-4 text-right hover:bg-white/3">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-neon-500/20 to-viol-500/20 border border-white/10 shrink-0">
                    {m.kind === "complaint" ? <MessageSquare className="w-5 h-5 text-rose-400" /> : <Mail className="w-5 h-5 text-neon-400" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.name} <span className="text-ink-300 font-normal">· {m.email}</span></p>
                    <p className="text-[11px] text-ink-300 truncate">{m.subject || "بدون موضوع"}</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 shrink-0">{KIND_LABEL[m.kind] ?? m.kind}</span>
                  <p className="text-[11px] text-ink-300 font-latin shrink-0">{new Date(m.createdAt).toLocaleDateString("ar-SA")}</p>
                </button>
                {open === m.id && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 bg-white/2">
                    <p className="text-sm text-ink-200 leading-relaxed rounded-2xl bg-white/5 px-4 py-3">{m.message || "—"}</p>
                    <p className="text-xs text-ink-300 mt-2 font-latin">المرسل: {m.email}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
