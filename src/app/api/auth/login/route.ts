import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { sql } from "drizzle-orm";
import { verifyPassword, newSessionToken, sessionExpiryDate, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const found = await db.select().from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
    if (!found.length || !verifyPassword(password, found[0].passwordHash)) {
      return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }
    const user = found[0];
    const token = newSessionToken();
    await db.insert(sessions).values({ token, userId: user.id, expiresAt: sessionExpiryDate() });
    const res = Response.json({ ok: true, user: { name: user.name, email: user.email } });
    res.headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    );
    return res;
  } catch (e) {
    console.error("login error", e);
    return Response.json({ error: "تعذر تسجيل الدخول" }, { status: 500 });
  }
}
