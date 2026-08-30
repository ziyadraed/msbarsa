import { requireRole } from "@/lib/guard";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  await requireRole(["admin"], "/login");
  const list = await db.select().from(stores).orderBy(desc(stores.createdAt));
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">المتاجر</h2>
      <div className="glass rounded-3xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {list.map((s) => (
            <div key={s.id} className="px-6 py-4 flex items-center gap-4">
              <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/5">
                <Store className="w-5 h-5 text-neon-400" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-[11px] text-ink-300 font-latin">{s.slug}.msbarsa.app</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5">{s.plan}</span>
              <span className="text-xs text-ink-300">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
