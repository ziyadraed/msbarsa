import { db } from "@/db";
import { storeMembers, users, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getStoreId } from "@/lib/tenant";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["manager", "staff"] as const;

async function merchantStore() {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "غير مصرح" }, { status: 401 }), storeId: "", user: null };
  if (user.role !== "merchant" && user.role !== "admin")
    return { error: Response.json({ error: "صلاحية غير كافية" }, { status: 403 }), storeId: "", user };
  const storeId = user.storeId ?? (await getStoreId());
  if (!storeId) return { error: Response.json({ error: "لا يوجد متجر مرتبط" }, { status: 400 }), storeId: "", user };
  return { error: null, storeId, user };
}

export async function GET() {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  const rows = await db
    .select({
      id: storeMembers.id,
      userId: storeMembers.userId,
      role: storeMembers.role,
      permissions: storeMembers.permissions,
      createdAt: storeMembers.createdAt,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
    })
    .from(storeMembers)
    .innerJoin(users, eq(users.id, storeMembers.userId))
    .where(eq(storeMembers.storeId, storeId));
  return Response.json({ members: rows });
}

export async function POST(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const role = String(body?.role ?? "staff");
    if (name.length < 2) return Response.json({ error: "اسم الموظف مطلوب" }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "بريد إلكتروني غير صالح" }, { status: 400 });
    if (!ALLOWED_ROLES.includes(role as never)) return Response.json({ error: "دور غير صالح" }, { status: 400 });

    // Find or create the staff user.
    let existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let userId: string;
    if (existing.length) {
      userId = existing[0].id;
    } else {
      const tempPassword = Math.random().toString(36).slice(2, 10);
      const [u] = await db
        .insert(users)
        .values({ name, email, passwordHash: await hashPassword(tempPassword), role: "merchant" })
        .returning();
      userId = u.id;
    }

    const clash = await db.select({ id: storeMembers.id }).from(storeMembers).where(and(eq(storeMembers.storeId, storeId), eq(storeMembers.userId, userId))).limit(1);
    if (clash.length) return Response.json({ error: "هذا الموظف مضاف مسبقًا" }, { status: 409 });

    const [row] = await db.insert(storeMembers).values({ storeId, userId, role, permissions: [] }).returning();
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "staff.add", entity: "member", entityId: row.id, meta: { email } });
    return Response.json({ ok: true, member: row });
  } catch (e) {
    console.error("add staff", e);
    return Response.json({ error: "تعذر إضافة الموظف" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const id = String(body?.id ?? "");
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(storeMembers).where(and(eq(storeMembers.id, id), eq(storeMembers.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    if (found[0].role === "owner") return Response.json({ error: "لا يمكن تعديل مالك المتجر" }, { status: 403 });
    const role = String(body?.role ?? found[0].role);
    await db.update(storeMembers).set({ role, permissions: Array.isArray(body?.permissions) ? body.permissions : found[0].permissions }).where(eq(storeMembers.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "staff.update", entity: "member", entityId: id, meta: { role } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الحفظ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error, storeId, user } = await merchantStore();
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ?? "";
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const found = await db.select().from(storeMembers).where(and(eq(storeMembers.id, id), eq(storeMembers.storeId, storeId))).limit(1);
    if (!found.length) return Response.json({ error: "غير موجود" }, { status: 404 });
    if (found[0].role === "owner") return Response.json({ error: "لا يمكن إزالة المالك" }, { status: 403 });
    await db.delete(storeMembers).where(eq(storeMembers.id, id));
    await db.insert(auditLogs).values({ storeId, userId: user?.id, action: "staff.remove", entity: "member", entityId: id });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "تعذر الإزالة" }, { status: 500 });
  }
}
