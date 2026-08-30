import { requireRole } from "@/lib/guard";
import { db } from "@/db";
import { stores, users, orders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { formatSAR } from "@/lib/utils";
import { Store, Users, Boxes, Wallet, Building2, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { user } = await requireRole(["admin"], "/login");

  const [storeCount, userCount, orderAgg, storeList] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(stores),
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db.select({ gmv: sql<number>`coalesce(sum(total),0)::int` }).from(orders),
    db.select().from(stores).orderBy(desc(stores.createdAt)).limit(8),
  ]);

  const cards = [
    { label: "المتاجر النشطة", value: String(storeCount[0]?.n ?? 0), icon: Store, tint: "text-neon-400 bg-neon-400/10 border-neon-400/25" },
    { label: "المستخدمون", value: String(userCount[0]?.n ?? 0), icon: Users, tint: "text-viol-400 bg-viol-500/10 border-viol-500/25" },
    { label: "إجمالي قيمة البضائع (GMV)", value: formatSAR(orderAgg[0]?.gmv ?? 0), icon: Wallet, tint: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
    { label: "المنتجات عبر المنصة", value: "—", icon: Boxes, tint: "text-amber-400 bg-amber-500/10 border-amber-400/25" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">أهلًا بك، {user.name} 🛡️</h2>
        <p className="text-sm text-ink-300 mt-1">نظرة عامة على أداء منصة مسبار</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-3xl p-5 hover-lift">
            <span className={`grid place-items-center w-11 h-11 rounded-2xl border ${c.tint} mb-4`}>
              <c.icon className="w-5 h-5" />
            </span>
            <p className="font-latin font-bold text-2xl">{c.value}</p>
            <p className="text-xs text-ink-300 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neon-400" /> أحدث المتاجر المسجلة
          </h3>
        </div>
        {storeList.length === 0 ? (
          <p className="text-sm text-ink-300 py-6 text-center">لا متاجر بعد</p>
        ) : (
          <div className="divide-y divide-white/5">
            {storeList.map((s) => (
              <div key={s.id} className="py-3 flex items-center gap-4">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5">
                  <ShieldCheck className="w-4 h-4 text-neon-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-[11px] text-ink-300">
                    {s.slug}.msbarsa.app · {s.plan}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                  s.status === "active"
                    ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                    : "bg-amber-400/10 text-amber-300 border-amber-400/20"
                }`}>
                  {s.status === "active" ? "نشط" : s.status}
                </span>
                <span className="text-[11px] text-ink-300 font-latin">
                  {new Date(s.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
