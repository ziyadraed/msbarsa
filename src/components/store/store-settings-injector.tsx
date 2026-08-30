import { getStoreBySlug } from "@/lib/tenant";
import { DEFAULT_STORE_SLUG } from "@/lib/tenant";

// Server component: reads the flagship store's design settings (set by the
// merchant in /merchant/store/design) and injects the announcement bar +
// accent color into the storefront. Kept lightweight so offline it renders null.
export default async function StoreSettingsInjector() {
  let settings: Record<string, unknown> = {};
  let accent = "#22d3ee";
  let announcement = "";
  try {
    const store = await getStoreBySlug(DEFAULT_STORE_SLUG);
    if (store?.settings && typeof store.settings === "object") {
      const s = store.settings as Record<string, unknown>;
      accent = String(s.accent ?? "#22d3ee");
      announcement = String(s.announcement ?? "");
    }
  } catch {
    // DB unavailable — skip injector.
  }

  if (!announcement) {
    return (
      <style>{`\n:root{--store-accent:${accent};}\n`}</style>
    );
  }

  return (
    <>
      <style>{`\n:root{--store-accent:${accent};}\n`}</style>
      <div
        className="w-full text-center text-sm font-semibold px-4 py-2.5"
        style={{ background: accent, color: "#03151e" }}
      >
        {announcement}
      </div>
    </>
  );
}
