import { getStoreBySlug } from "@/lib/tenant";
import { DEFAULT_STORE_SLUG } from "@/lib/tenant";

export const dynamic = "force-dynamic";

// Returns the merchant's custom informative pages for the storefront footer.
export async function GET() {
  try {
    const store = await getStoreBySlug(DEFAULT_STORE_SLUG);
    const s = (store?.settings ?? {}) as Record<string, unknown>;
    const pages = Array.isArray(s.pages) ? s.pages : [];
    return Response.json({
      pages: pages.map((p: any) => ({ slug: String(p?.slug ?? ""), title: String(p?.title ?? "") })).filter((p) => p.slug),
    });
  } catch {
    return Response.json({ pages: [] });
  }
}
