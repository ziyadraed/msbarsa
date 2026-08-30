import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
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

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { cur.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      cur.push(field); field = "";
      if (cur.some((x) => x !== "")) rows.push(cur);
      cur = [];
    } else field += c;
  }
  cur.push(field);
  if (cur.some((x) => x !== "")) rows.push(cur);
  return rows;
}

export async function POST(req: Request) {
  const { error, storeId } = await merchantStore();
  if (error) return error;
  try {
    const body = await req.json();
    const csvText = String(body?.csv ?? "").replace(/^\uFEFF/, "");
    if (!csvText.trim()) return Response.json({ error: "لا يوجد محتوى CSV" }, { status: 400 });
    const rows = parseCSV(csvText);
    if (rows.length < 2) return Response.json({ error: "الملف فارغ" }, { status: 400 });

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const nameIdx = header.indexOf("الاسم");
    const emailIdx = header.indexOf("البريد");
    const phoneIdx = header.indexOf("الجوال");
    if (nameIdx < 0 || emailIdx < 0)
      return Response.json({ error: "يجب أن يحتوي الملف على عمودي «الاسم» و«البريد»" }, { status: 400 });

    let created = 0;
    let skipped = 0;
    for (const r of rows.slice(1)) {
      const name = (r[nameIdx] ?? "").trim();
      const email = (r[emailIdx] ?? "").trim().toLowerCase();
      if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { skipped++; continue; }
      const clash = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1);
      if (clash.length) { skipped++; continue; }
      await db.insert(customers).values({
        storeId,
        name,
        email,
        phone: phoneIdx >= 0 ? String(r[phoneIdx] ?? "").trim() : "",
        tags: [],
      });
      created++;
    }
    return Response.json({ ok: true, created, skipped });
  } catch (e) {
    console.error("import customers", e);
    return Response.json({ error: "تعذر استيراد العملاء" }, { status: 500 });
  }
}
