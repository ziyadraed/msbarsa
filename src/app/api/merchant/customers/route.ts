import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
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
  const q = searchParams.get("q") ?? undefined;
  const conds = [eq(customers.storeId, storeId)];
  if (q) {
    const p = `%${q}%`;
    conds.push(or(like(customers.name, p), like(customers.email, p), like(customers.phone, p))!);
  }
  const rows = await db.select().from(customers).where(and(...conds)!).orderBy(desc(customers.totalSpent)).limit(200);
  return Response.json({ customers: rows });
}
