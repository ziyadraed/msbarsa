import type { ReactNode } from "react";
import { AppWindow, FileText, Server, PenTool, ShieldCheck, DraftingCompass, KeyRound } from "lucide-react";

const THEMES: Record<string, { from: string; via: string; to: string; glow: string; icon: ReactNode; glyph: string }> = {
  windows: {
    from: "#0b2b4e", via: "#0e4d8a", to: "#0b1f3a",
    glow: "rgba(56,189,248,0.35)",
    icon: <AppWindow className="w-9 h-9" strokeWidth={1.4} />,
    glyph: "WIN",
  },
  office: {
    from: "#4a2b0b", via: "#8a4d0e", to: "#3a1f08",
    glow: "rgba(251,146,60,0.35)",
    icon: <FileText className="w-9 h-9" strokeWidth={1.4} />,
    glyph: "365",
  },
  server: {
    from: "#06303a", via: "#0e5a63", to: "#072932",
    glow: "rgba(45,212,191,0.32)",
    icon: <Server className="w-9 h-9" strokeWidth={1.4} />,
    glyph: "SRV",
  },
  adobe: {
    from: "#43092e", via: "#8f1d56", to: "#2e0620",
    glow: "rgba(232,121,249,0.35)",
    icon: <PenTool className="w-9 h-9" strokeWidth={1.4} />,
    glyph: "CC",
  },
  security: {
    from: "#06321e", via: "#0e6a3d", to: "#052919",
    glow: "rgba(52,211,153,0.35)",
    icon: <ShieldCheck className="w-9 h-9" strokeWidth={1.4} />,
    glyph: "SEC",
  },
  autodesk: {
    from: "#1c1440", via: "#43319b", to: "#150f33",
    glow: "rgba(167,139,250,0.35)",
    icon: <DraftingCompass className="w-9 h-9" strokeWidth={1.4} />,
    glyph: "CAD",
  },
};

/**
 * Original generative artwork for product tiles — intentionally avoids any
 * brand box-art or trademarks imagery; pure CSS gradient + typography.
 */
export default function ProductArt({ category, latin, size = "md" }: { category: string; latin?: string; size?: "md" | "lg" }) {
  const t = THEMES[category] ?? THEMES.windows;
  const isLg = size === "lg";
  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      dir="ltr"
      style={{ background: `linear-gradient(145deg, ${t.from}, ${t.via} 55%, ${t.to})` }}
    >
      {/* radial glow */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 20%, ${t.glow}, transparent 60%)` }} />
      {/* geometric panes */}
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-[12%] right-[10%] w-[38%] h-[52%] rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-[2px]" />
        <div className="absolute top-[26%] right-[24%] w-[40%] h-[56%] rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.09] to-transparent" />
      </div>
      {/* giant glyph */}
      <div
        className={`absolute -bottom-[8%] left-[2%] font-latin font-bold leading-none text-white/10 ${
          isLg ? "text-[11rem]" : "text-[7.5rem]"
        }`}
      >
        {t.glyph}
      </div>
      {/* grid dots */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to top, black 5%, transparent 55%)",
        }}
      />
      {/* key chip */}
      <div className="absolute bottom-[12%] right-[7%] flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 py-1.5 backdrop-blur-md">
        <KeyRound className="w-3.5 h-3.5 text-white/80" />
        <span className="font-latin text-[10px] tracking-[0.22em] text-white/75">DIGITAL KEY</span>
      </div>
      {/* icon */}
      <div className={`absolute ${isLg ? "top-[14%] right-[12%]" : "top-[12%] right-[10%]"} text-white/90 -translate-x-[45%]`}>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md shadow-2xl">{t.icon}</div>
      </div>
      {/* latin caption */}
      {latin && (
        <div className="absolute bottom-[13%] left-[7%] max-w-[46%] text-right">
          <span className={`font-latin font-semibold tracking-wide text-white/85 ${isLg ? "text-xl" : "text-sm"}`}>{latin}</span>
        </div>
      )}
      {/* shine sweep */}
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/[0.05] to-transparent" />
    </div>
  );
}
