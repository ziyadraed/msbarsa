import { getStoreBySlug } from "@/lib/tenant";
import { DEFAULT_STORE_SLUG } from "@/lib/tenant";

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
  try {
    const store = await getStoreBySlug(DEFAULT_STORE_SLUG);
    if (store?.settings && typeof store.settings === "object") {
      const s = store.settings as Record<string, unknown>;
      theme = String(s.theme ?? "raed");
      accent = String(s.accent ?? THEMES.raed.accent);
      announcement = String(s.announcement ?? "");
    }
  } catch {
    // DB unavailable — skip injector.
  }

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

  if (!announcement) {
    return (
      <>
        <style>{css}</style>
        <StoreThemeTag theme={theme} />
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <StoreThemeTag theme={theme} />
      <div
        className="w-full text-center text-sm font-semibold px-4 py-2.5"
        style={{ background: effAccent, color: "#03151e" }}
      >
        {announcement}
      </div>
    </>
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
