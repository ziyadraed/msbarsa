import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

async function merchantStore() {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "غير مصرح" }, { status: 401 }), storeId: "" };
  if (user.role !== "merchant" && user.role !== "admin")
    return { error: Response.json({ error: "صلاحية غير كافية" }, { status: 403 }), storeId: "" };
  const storeId = user.storeId ?? (await getStoreId());
  if (!storeId) return { error: Response.json({ error: "لا يوجد متجر مرتبط" }, { status: 400 }), storeId: "" };
  return { error: null, storeId };
}

export async function GET(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 200), 500);
  const action = searchParams.get("action") ?? undefined;
  const conds = [eq(auditLogs.storeId, storeId)];
  if (action && action !== "all") conds.push(eq(auditLogs.action, action));
  const rows = await db
    .select()
    .from(auditLogs)
    .where(and(...conds))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
  return Response.json({ logs: rows });
}
