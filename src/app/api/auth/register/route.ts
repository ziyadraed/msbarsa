import { db } from "@/db";
import { users, sessions, stores, storeMembers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { hashPassword, newSessionToken, sessionExpiryDate, SESSION_COOKIE } from "@/lib/auth";
import { validEmail, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const role = String(body?.role ?? "customer");
    const storeName = String(body?.storeName ?? "").trim();

    if (name.length < 2) return Response.json({ error: "الاسم مطلوب" }, { status: 400 });
    if (!validEmail(email)) return Response.json({ error: "بريد إلكتروني غير صالح" }, { status: 400 });
    if (password.length < 6) return Response.json({ error: "كلمة المرور 6 أحرف على الأقل" }, { status: 400 });
    if (role === "merchant" && storeName.length < 2) {
      return Response.json({ error: "اسم المتجر مطلوب للتسجيل كتاجر" }, { status: 400 });
    }

    const existing = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
    if (existing.length) return Response.json({ error: "يوجد حساب مسجل بهذا البريد — سجّل الدخول" }, { status: 409 });

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashPassword(password),
        role: role === "merchant" ? "merchant" : "customer",
      })
      .returning({ id: users.id });

    // If merchant, auto-create their tenant store and link ownership.
    if (role === "merchant") {
      const slug = slugify(storeName);
      let finalSlug = slug;
      let attempt = 0;
      // ensure unique store slug
      for (;;) {
        const clash = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, finalSlug)).limit(1);
        if (!clash.length) break;
        attempt += 1;
        finalSlug = `${slug}-${attempt}`;
      }
      const [store] = await db
        .insert(stores)
        .values({ slug: finalSlug, name: storeName, ownerId: user.id, email })
        .returning({ id: stores.id });
      await db.update(users).set({ storeId: store.id }).where(eq(users.id, user.id));
      await db.insert(storeMembers).values({ storeId: store.id, userId: user.id, role: "owner" });
    }

    const token = newSessionToken();
    await db.insert(sessions).values({ token, userId: user.id, expiresAt: sessionExpiryDate() });

    const res = Response.json({
      ok: true,
      user: { name, email, role, storeName: role === "merchant" ? storeName : undefined },
    });
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
