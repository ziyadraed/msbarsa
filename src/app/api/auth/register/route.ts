import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { hashPassword, newSessionToken, sessionExpiryDate, SESSION_COOKIE } from "@/lib/auth";
import { validEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (name.length < 2) return Response.json({ error: "الاسم مطلوب" }, { status: 400 });
    if (!validEmail(email)) return Response.json({ error: "بريد إلكتروني غير صالح" }, { status: 400 });
    if (password.length < 6) return Response.json({ error: "كلمة المرور 6 أحرف على الأقل" }, { status: 400 });

    const existing = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
    if (existing.length) return Response.json({ error: "يوجد حساب مسجل بهذا البريد — سجّل الدخول" }, { status: 409 });

    const [user] = await db.insert(users).values({ name, email, passwordHash: hashPassword(password) }).returning({ id: users.id });

    const token = newSessionToken();
    await db.insert(sessions).values({ token, userId: user.id, expiresAt: sessionExpiryDate() });

    const res = Response.json({ ok: true, user: { name, email } });
    res.headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    );
    return res;
  } catch (e) {
    console.error("register error", e);
    return Response.json({ error: "تعذر إنشاء الحساب" }, { status: 500 });
  }
}
