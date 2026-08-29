import { getProducts, getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const deals = searchParams.get("deals") === "1";
  const sort = searchParams.get("sort") ?? undefined;
  const [list, cats] = await Promise.all([
    getProducts({ category, q, deals, sort }),
    getCategories(),
  ]);
  return Response.json({ products: list, categories: cats });
}
