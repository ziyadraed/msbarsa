import { requireRole } from "@/lib/guard";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireRole(["admin"], "/login");
  const list = await db.select().from(users).orderBy(desc(users.createdAt));
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">المستخدمون</h2>
      <div className="glass rounded-3xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {list.map((u) => (
            <div key={u.id} className="px-6 py-4 flex items-center gap-4">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-neon-500/30 to-viol-500/30 border border-white/10 font-bold text-xs">
                {u.name?.[0]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="text-[11px] text-ink-300">{u.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5">{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
