"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const OPTIONS = [
  { id: "newOrder" as const, label: "طلب جديد", desc: "إشعار عند استلام طلب جديد" },
  { id: "lowStock" as const, label: "مخزون منخفض", desc: "تنبيه عندما يصل المنتج لمخزون منخفض" },
  { id: "refund" as const, label: "استرداد", desc: "إشعار عند طلب استرداد" },
  { id: "customerMsg" as const, label: "رسائل العملاء", desc: "إشعار عند وصول رسالة جديدة" },
  { id: "dailyReport" as const, label: "التقرير اليومي", desc: "ملخص يومي لمبيعاتك" },
];

export default function NotificationsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({
    newOrder: true, lowStock: true, refund: true, customerMsg: true, dailyReport: false,
  });

  useEffect(() => {
    fetch("/api/merchant/settings").then((r) => r.json()).then((d) => {
      const s = d.store?.settings ?? {};
      setFlags((f) => ({ ...f, ...(s.notifications ?? {}) }));
    }).finally(() => setLoaded(true));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "مسبار", design: { notifications: flags } }),
      });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "تعذر الحفظ");
      toast.success("تم حفظ الإشعارات");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">إشعارات المتجر</h2>
        <p className="text-sm text-ink-300 mt-1">تحكّم في الإشعارات التي تصلك</p>
      </div>

      {!loaded ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="glass rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-400/15 border border-amber-400/30">
              <Bell className="w-5 h-5 text-amber-400" />
            </span>
            <p className="font-bold">تفضيلات الإشعارات</p>
          </div>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setFlags((f) => ({ ...f, [o.id]: !f[o.id] }))}
              className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-right"
            >
              <div>
                <p className="text-sm font-semibold">{o.label}</p>
                <p className="text-[11px] text-ink-300 mt-0.5">{o.desc}</p>
              </div>
              <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${flags[o.id] ? "bg-amber-500" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${flags[o.id] ? "right-0.5" : "right-5.5"}`} />
              </span>
            </button>
          ))}
          <button type="submit" disabled={saving} className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2 mt-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
          </button>
        </form>
      )}
    </div>
  );
}
