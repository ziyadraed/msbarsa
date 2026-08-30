"use client";

import { useEffect, useState } from "react";
import { CreditCard, RefreshCw, Search, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Card = {
  id: string;
  productName: string;
  licenseKey: string;
  price: number;
  qty: number;
  order: { orderNumber: string; email: string; createdAt: string } | null;
};

export default function DigitalCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/merchant/digital-cards?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setCards(d.cards ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function copy(key: string) {
    navigator.clipboard.writeText(key).then(() => toast.success("تم نسخ المفتاح"));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">سجل البطاقات الرقمية</h2>
          <p className="text-sm text-ink-300 mt-1">مفاتيح الترخيص المُسلمة في طلبات متجرك — {cards.length} بطاقة</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <input className="inp pl-3 pr-10" placeholder="ابحث بالمفتاح أو المنتج..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          </div>
          <button onClick={load} className="btn-ghost rounded-2xl p-2.5 grid place-items-center"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-300 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...</div>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center text-ink-300 text-sm">لا بطاقات رقمية بعد — تُسجَّل تلقائيًا عند إتمام الطلبات التي تحتوي منتجات رقمية</div>
        ) : (
          <div className="divide-y divide-white/5">
            {cards.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5 shrink-0"><CreditCard className="w-5 h-5 text-neon-400" /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.productName} {c.qty > 1 && <span className="text-ink-300">×{c.qty}</span>}</p>
                  <p className="text-[11px] text-ink-300 truncate">{c.order?.email ?? "—"} · #{c.order?.orderNumber ?? ""}</p>
                </div>
                <button onClick={() => copy(c.licenseKey)} className="font-latin text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-emerald-400/15">
                  <Copy className="w-3 h-3" /> {c.licenseKey}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
