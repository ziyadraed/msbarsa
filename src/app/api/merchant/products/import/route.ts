import { db } from "@/db";
import { products, auditLogs } from "@/db/schema";
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
    const csvText = String(body?.csv ?? "");
    if (!csvText.trim()) return Response.json({ error: "لا يوجد محتوى CSV" }, { status: 400 });
    const rows = parseCSV(csvText.replace(/^\uFEFF/, ""));
    if (rows.length < 2) return Response.json({ error: "الملف فارغ أو بدون بيانات" }, { status: 400 });

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const nameIdx = header.indexOf("الاسم");
    const priceIdx = header.indexOf("السعر");
    const stockIdx = header.indexOf("المخزون");
    const catIdx = header.indexOf("القسم");
    if (nameIdx < 0 || priceIdx < 0)
      return Response.json({ error: "يجب أن يحتوي الملف على عمودي «الاسم» و«السعر»" }, { status: 400 });

    let created = 0;
    const lines = rows.slice(1);
    for (const r of lines) {
      const name = (r[nameIdx] ?? "").trim();
      const price = Number(r[priceIdx]);
      if (name.length < 2 || !price || price <= 0) continue;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)}-${Date.now().toString(36)}-${created}`;
      await db.insert(products).values({
        storeId,
        slug,
        categorySlug: catIdx >= 0 && r[catIdx]?.trim() ? r[catIdx].trim() : "windows",
        name,
        price: Math.round(price),
        stock: stockIdx >= 0 ? Math.round(Number(r[stockIdx]) || 0) : 0,
        status: "active",
        type: "digital",
        images: [],
        features: [],
      });
      created++;
    }
    await db.insert(auditLogs).values({ storeId, action: "product.import", entity: "products", meta: { count: created } });
    return Response.json({ ok: true, created });
  } catch (e) {
    console.error("import products", e);
    return Response.json({ error: "تعذر استيراد المنتجات" }, { status: 500 });
  }
}
