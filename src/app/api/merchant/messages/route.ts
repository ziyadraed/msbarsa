import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
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

export async function GET() {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const rows = await db
    .select()
    .from(contactMessages)
    .where(or(eq(contactMessages.storeId, storeId), eq(contactMessages.storeId, "")))
    .orderBy(desc(contactMessages.createdAt))
    .limit(200);
  return Response.json({ messages: rows });
}
