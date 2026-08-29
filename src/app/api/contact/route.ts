import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { validEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const kind = body?.kind === "newsletter" ? "newsletter" : "support";
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!validEmail(email)) {
      return Response.json({ error: "الرجاء إدخال بريد إلكتروني صحيح" }, { status: 400 });
    }
    if (kind === "support") {
      const name = String(body?.name ?? "").trim();
      const subject = String(body?.subject ?? "").trim();
      const message = String(body?.message ?? "").trim();
      if (!name || !message) {
        return Response.json({ error: "الرجاء تعبئة الاسم ونص الرسالة" }, { status: 400 });
      }
      await db.insert(contactMessages).values({ kind, name, email, subject, message });
    } else {
      await db.insert(contactMessages).values({ kind, email, subject: "newsletter" });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("contact error", e);
    return Response.json({ error: "تعذر إرسال الرسالة" }, { status: 500 });
  }
}
