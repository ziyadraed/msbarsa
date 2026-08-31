import { getStoreBySlug } from "@/lib/tenant";
import { DEFAULT_STORE_SLUG } from "@/lib/tenant";

export const dynamic = "force-dynamic";

// Public store branding for the storefront header/footer (name, logo, tagline).
export async function GET() {
  try {
    const store = await getStoreBySlug(DEFAULT_STORE_SLUG);
    const s = (store?.settings ?? {}) as Record<string, unknown>;
    return Response.json({
      name: store?.name ?? "مسبار",
      logo: store?.logo ?? "",
      tagline: String(s.tagline ?? ""),
    });
  } catch {
    return Response.json({ name: "مسبار", logo: "", tagline: "" });
  }
}
