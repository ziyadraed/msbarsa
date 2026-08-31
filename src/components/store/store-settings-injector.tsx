import { getStoreBySlug } from "@/lib/tenant";
import { DEFAULT_STORE_SLUG } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";

// Theme palettes drive the storefront look. Because Tailwind v4 compiles
// color utilities to CSS vars (--color-neon-400, --color-ink-*), overriding
// them at runtime re-themes the entire storefront instantly.
// Each palette = { accent, neon400, neon500 } plus optional bg tint.
type ThemePalette = {
  accent: string;
  neon400: string;
  neon500: string;
};

const THEMES: Record<string, ThemePalette> = {
  raed: { accent: "#22d3ee", neon400: "#22d3ee", neon500: "#0ea5e9" },
  mawj: { accent: "#2dd4bf", neon400: "#2dd4bf", neon500: "#14b8a6" },
  layl: { accent: "#a78bfa", neon400: "#a78bfa", neon500: "#8b5cf6" },
  shams: { accent: "#fbbf24", neon400: "#fbbf24", neon500: "#f59e0b" },
};

export const THEME_NAMES: Record<string, string> = {
  raed: "رائد",
  mawj: "موج",
  layl: "ليل",
  shams: "شمس",
};

// Server component: reads the flagship store's design settings (set by the
// merchant in /merchant/store/themes and /merchant/store/design) and injects
// the active theme palette, accent color, and announcement bar into the
// storefront. Kept lightweight so offline it renders null.
export default async function StoreSettingsInjector() {
  let settings: Record<string, unknown> = {};
  let theme = "raed";
  let accent = THEMES.raed.accent;
  let announcement = "";
  let maintenanceEnabled = false;
  let maintenanceMessage = "";
  try {
    const store = await getStoreBySlug(DEFAULT_STORE_SLUG);
    if (store?.settings && typeof store.settings === "object") {
      const s = store.settings as Record<string, unknown>;
      theme = String(s.theme ?? "raed");
      accent = String(s.accent ?? THEMES.raed.accent);
      announcement = String(s.announcement ?? "");
      maintenanceEnabled = s.maintenanceEnabled === true;
      maintenanceMessage = String(s.maintenanceMessage ?? "المتجر قيد الصيانة حاليًا — عد لاحقًا");
    }
  } catch {
    // DB unavailable — skip injector.
  }

  // Maintenance gate: block customers with a full-screen notice, but let the
  // store owner/admin (signed-in merchant) keep browsing the storefront.
  let isOwner = false;
  try {
    const u = await getSessionUser();
    isOwner = !!u && (u.role === "merchant" || u.role === "admin");
  } catch {
    isOwner = false;
  }
  const inMaintenance = maintenanceEnabled && !isOwner;

  const pal = THEMES[theme] ?? THEMES.raed;
  // Explicit accent (set in /store/design) wins over the theme default.
  const effAccent = accent || pal.accent;

  const css = `
:root{
  --store-accent:${effAccent};
  --color-neon-400:${pal.neon400};
  --color-neon-500:${pal.neon500};
}
[data-store-theme]{
  --store-accent:${effAccent};
}
`;

  return (
    <>
      <style>{css}</style>
      <StoreThemeTag theme={theme} />
      {announcement && (
        <div
          className="w-full text-center text-sm font-semibold px-4 py-2.5"
          style={{ background: effAccent, color: "#03151e" }}
        >
          {announcement}
        </div>
      )}
      {inMaintenance && <MaintenanceScreen message={maintenanceMessage} accent={effAccent} />}
    </>
  );
}

function MaintenanceScreen({ message, accent }: { message: string; accent: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6 text-center bg-ink-950">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative">
        <span
          className="mx-auto mb-6 grid place-items-center w-16 h-16 rounded-3xl border"
          style={{ background: `${accent}22`, borderColor: `${accent}55`, color: accent }}
        >
          <WrenchIcon />
        </span>
        <h1 className="text-3xl font-bold mb-3">المتجر قيد الصيانة</h1>
        <p className="text-ink-300 max-w-md leading-7">{message}</p>
      </div>
    </div>
  );
}

function WrenchIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// Injects the active theme id as an attribute on <html> so theme-specific
// selectors can target it (e.g. custom fonts, borders).
function StoreThemeTag({ theme }: { theme: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.setAttribute('data-store-theme','${theme.replace(/[^a-zA-Z0-9-]/g, "")}')`,
      }}
    />
  );
}
