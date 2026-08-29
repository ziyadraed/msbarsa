"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, User, ShoppingBag, Radar, Menu, X, Sparkles, PackageSearch, LifeBuoy, BadgePercent, Store, Home, Loader2 } from "lucide-react";
import { useCart } from "./cart-provider";
import CartDrawer from "./cart-drawer";
import { cn, formatSAR } from "@/lib/utils";
import type { Product } from "@/lib/catalog";

const NAV = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/shop", label: "المتجر", icon: Store },
  { href: "/shop?deals=1", label: "العروض", icon: BadgePercent },
  { href: "/track", label: "تتبع الطلب", icon: PackageSearch },
  { href: "/support", label: "الدعم", icon: LifeBuoy },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className="relative grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-neon-500 via-neon-400 to-viol-500 text-ink-950 shadow-[0_10px_30px_-8px_rgba(34,211,238,0.6)] group-hover:rotate-6 transition-transform duration-500">
        <Radar className="w-6 h-6" strokeWidth={2} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-xl font-bold">مسبار</span>
          <span className="block font-latin text-[10px] tracking-[0.35em] text-ink-300">MESBAR.STORE</span>
        </span>
      )}
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => setUser(d.user)).catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      {/* announcement bar */}
      <div className="relative z-40 bg-gradient-to-l from-neon-500/15 via-viol-500/10 to-neon-500/15 border-b border-white/5 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 h-9 flex items-center justify-center gap-2 text-[11px] sm:text-xs text-ink-200">
          <Sparkles className="w-3.5 h-3.5 text-neon-400" />
          <span>تسليم فوري خلال دقائق عبر بريدك الإلكتروني — تراخيص أصلية مع ضمان الاستبدال</span>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          scrolled ? "glass-strong shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]" : "bg-transparent border-b border-white/5"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 h-[74px] flex items-center gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href.split("?")[0]) && n.href !== "/";
              return (
                <Link
                  key={n.href + n.label}
                  href={n.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm transition-all duration-300",
                    active ? "text-neon-400 bg-neon-400/10" : "text-ink-200 hover:text-white hover:bg-white/5"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 mr-auto lg:mr-0">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
              className="grid place-items-center w-11 h-11 rounded-2xl btn-ghost text-ink-200 hover:text-neon-400"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href={user ? "/account" : "/login"}
              aria-label="حسابي"
              className="hidden sm:grid place-items-center w-11 h-11 rounded-2xl btn-ghost text-ink-200 hover:text-neon-400 relative"
            >
              <User className="w-5 h-5" />
              {user && <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400" />}
            </Link>
            <button
              onClick={() => cart.setOpen(true)}
              aria-label="السلة"
              className="relative grid place-items-center w-11 h-11 rounded-2xl btn-ghost text-ink-200 hover:text-neon-400"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.count > 0 && (
                <span className="absolute -top-1 -left-1 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-neon-400 text-ink-950 text-[11px] font-bold font-latin">
                  {cart.count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="القائمة"
              className="lg:hidden grid place-items-center w-11 h-11 rounded-2xl btn-ghost text-ink-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-md lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute top-0 bottom-0 right-0 w-[300px] glass-strong p-6 flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <Logo compact />
                <button onClick={() => setMobileOpen(false)} className="w-10 h-10 grid place-items-center rounded-xl btn-ghost" aria-label="إغلاق">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {NAV.map((n) => (
                <Link key={n.href + n.label} href={n.href} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-ink-200 hover:bg-white/5 hover:text-neon-400 transition-colors">
                  <n.icon className="w-5 h-5" />
                  {n.label}
                </Link>
              ))}
              <Link href={user ? "/account" : "/login"} className="mt-auto btn-primary rounded-2xl text-center py-3 font-semibold">
                {user ? `مرحبًا ${user.name.split(" ")[0]}` : "تسجيل الدخول"}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
    else {
      setQ("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setResults(d.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-xl flex items-start justify-center pt-[14vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="w-full max-w-2xl glass-strong rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-6 border-b border-white/8">
              <Search className="w-5 h-5 text-neon-400 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن منتج… ويندوز، أوفيس، أدوبي"
                className="w-full py-5 bg-transparent outline-none text-lg placeholder:text-ink-600"
              />
              {loading && <Loader2 className="w-5 h-5 animate-spin text-ink-300" />}
              <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-xl btn-ghost shrink-0" aria-label="إغلاق البحث">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[46vh] overflow-y-auto p-3">
              {results.length === 0 && q.trim() && !loading && (
                <p className="text-center text-ink-300 py-10 text-sm">لا توجد نتائج مطابقة — جرّب كلمة أخرى</p>
              )}
              {results.map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors group"
                >
                  <span className="w-2 h-2 rounded-full bg-neon-400/70 group-hover:scale-125 transition-transform" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-ink-300 font-latin">{p.latinName}</span>
                  </span>
                  <span className="text-neon-400 font-semibold text-sm">{formatSAR(p.price)}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
